import type { Handler } from '@netlify/functions';
import { verifyOAuthState, encryptToken } from './_shared/crypto';
import { exchangeLinkedInCode, getLinkedInProfile } from './_shared/linkedin';
import { saveDocument } from './_shared/firestoreAdmin';
import { checkRateLimit } from './_shared/rateLimit';

export const handler: Handler = async (event) => {
  const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  
  // Rate limiting on callback: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`oauth_callback_${clientIp}`, 20, 60000);

  const query = event.queryStringParameters || {};
  const host = event.headers.host || 'cheery-hummingbird-7ecc95.netlify.app';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  if (!rateCheck.allowed) {
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      },
      body: '',
    };
  }

  // Handle user cancelled or denied error from LinkedIn
  if (query.error) {
    console.warn('[OAuthCallback] Platform returned error:', query.error);
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Social authorization was cancelled or denied.')}`,
      },
      body: '',
    };
  }

  const code = query.code;
  const state = query.state;

  if (!code || !state) {
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Missing authorization parameters.')}`,
      },
      body: '',
    };
  }

  // Validate state (CSRF + tenant binding + 10-minute expiry + nonce integrity)
  const stateResult = verifyOAuthState(state);
  if (!stateResult.valid || !stateResult.userId || !stateResult.platform) {
    console.error('[OAuthCallback] State verification failed:', stateResult.error);
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired OAuth state.')}`,
      },
      body: '',
    };
  }

  const { userId, platform } = stateResult;

  try {
    if (platform === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID || '';
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/oauth-callback`;

      if (!clientId || !clientSecret) {
        console.error('[OAuthCallback] LinkedIn credentials missing in environment.');
        return {
          statusCode: 302,
          headers: {
            Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Server configuration error. Contact administrator.')}`,
          },
          body: '',
        };
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
        accessTokenEncrypted: encryptToken(tokenData.access_token),
        refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        tokenExpiresAt: expiresAt,
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        status: 'connected',
        connectedAt: now,
        updatedAt: now,
      };

      const docId = `${userId}_linkedin`;
      await saveDocument('social_connections', docId, connectionDoc);

      console.log(`[OAuthCallback] Successfully connected LinkedIn for owner: ${userId} (${profile.name})`);

      return {
        statusCode: 302,
        headers: {
          Location: `${baseUrl}/dashboard?social_connected=linkedin&account_name=${encodeURIComponent(profile.name)}`,
        },
        body: '',
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Unsupported platform.')}`,
      },
      body: '',
    };
  } catch (err: any) {
    console.error('[OAuthCallback] Failed to complete OAuth exchange:', err);
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/dashboard?social_error=${encodeURIComponent('Failed to complete social authentication. Please try again.')}`,
      },
      body: '',
    };
  }
};
