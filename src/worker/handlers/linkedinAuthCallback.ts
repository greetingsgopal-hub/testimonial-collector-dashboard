import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeLinkedInCode, getLinkedInProfile } from '../lib/linkedin';
import { saveDocument } from '../lib/firestoreAdmin';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleLinkedInAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate limiting on callback: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`linkedin_callback_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      302
    );
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[LinkedInOAuthCallback] LinkedIn returned error:', queryError);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('LinkedIn authorization was cancelled or denied.')}`,
      302
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Missing authorization parameters from LinkedIn.')}`,
      302
    );
  }

  // Validate state token against CSRF, expiration, and user binding
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId) {
    console.error('[LinkedInOAuthCallback] State verification failed:', stateResult.error);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired OAuth state.')}`,
      302
    );
  }

  const { userId } = stateResult;

  try {
    const clientId = env.LINKEDIN_CLIENT_ID || '';
    const clientSecret = env.LINKEDIN_CLIENT_SECRET || '';
    const redirectUri = env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/auth/linkedin/callback`;

    if (!clientId || !clientSecret) {
      console.warn('[LinkedInOAuthCallback] LINKEDIN credentials missing in environment.');
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_connected=linkedin&notice=${encodeURIComponent('LinkedIn is not configured yet. Please contact support.')}`,
        302
      );
    }

    // 1. Exchange authorization code for access token
    const tokenData = await exchangeLinkedInCode(code, redirectUri, clientId, clientSecret);

    // 2. Fetch authenticated member profile
    const profile = await getLinkedInProfile(tokenData.access_token);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // 3. Encrypt and store connection document in Firestore
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

    console.log(`[LinkedInOAuthCallback] Connected LinkedIn for owner: ${userId} (${profile.name})`);

    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_connected=linkedin&account_name=${encodeURIComponent(profile.name)}`,
      302
    );
  } catch (err: any) {
    console.error('[LinkedInOAuthCallback] Failed to complete OAuth exchange:', err);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Failed to complete LinkedIn authentication. Please try again.')}`,
      302
    );
  }
}
