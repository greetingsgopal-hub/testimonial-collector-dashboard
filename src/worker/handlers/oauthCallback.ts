import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeLinkedInCode, getLinkedInProfile } from '../lib/linkedin';
import { saveDocument } from '../lib/firestoreAdmin';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleOAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';

  // Rate limiting on callback: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`oauth_callback_${clientIp}`, 20, 60000);

  const url = new URL(request.url);
  const baseUrl = url.origin;

  if (!rateCheck.allowed) {
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      302
    );
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[OAuthCallback] Platform returned error:', queryError);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Social authorization was cancelled or denied.')}`,
      302
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Missing authorization parameters.')}`,
      302
    );
  }

  // Validate state (CSRF + tenant binding + 10-minute expiry + nonce integrity)
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId || !stateResult.platform) {
    console.error('[OAuthCallback] State verification failed:', stateResult.error);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired OAuth state.')}`,
      302
    );
  }

  const { userId, platform } = stateResult;

  try {
    if (platform === 'linkedin') {
      const clientId = env.LINKEDIN_CLIENT_ID || '';
      const clientSecret = env.LINKEDIN_CLIENT_SECRET || '';
      const redirectUri = env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/oauth-callback`;

      if (!clientId || !clientSecret) {
        console.error('[OAuthCallback] LinkedIn credentials missing in environment.');
        return Response.redirect(
          `${baseUrl}/dashboard?social_error=${encodeURIComponent('Server configuration error. Contact administrator.')}`,
          302
        );
      }

      // Exchange code for access token
      const tokenData = await exchangeLinkedInCode(code, redirectUri, clientId, clientSecret);

      // Fetch member profile
      const profile = await getLinkedInProfile(tokenData.access_token);

      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Secure connection document — tokens encrypted with AES-256-GCM
      const connectionDoc = {
        ownerId: userId,
        platform: 'linkedin',
        platformUserId: `urn:li:person:${profile.sub}`,
        platformAccountName: profile.name,
        platformProfilePicture: profile.picture || null,
        accountType: 'member',
        accessTokenEncrypted: encryptToken(tokenData.access_token, env),
        refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token, env) : null,
        tokenExpiresAt: expiresAt,
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        status: 'connected',
        connectedAt: now,
        updatedAt: now,
      };

      const docId = `${userId}_linkedin`;
      await saveDocument('social_connections', docId, connectionDoc, undefined, env);

      console.log(`[OAuthCallback] Successfully connected LinkedIn for owner: ${userId} (${profile.name})`);

      return Response.redirect(
        `${baseUrl}/dashboard?social_connected=linkedin&account_name=${encodeURIComponent(profile.name)}`,
        302
      );
    }

    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Unsupported platform.')}`,
      302
    );
  } catch (err: any) {
    console.error('[OAuthCallback] Failed to complete OAuth exchange:', err);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Failed to complete social authentication. Please try again.')}`,
      302
    );
  }
}
