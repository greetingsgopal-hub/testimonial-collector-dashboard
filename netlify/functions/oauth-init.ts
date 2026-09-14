import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { generateOAuthState } from './_shared/crypto';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const token = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(token || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized: Valid ReviewVault session required.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const platform = body.platform || 'linkedin';

    if (platform === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${event.headers.origin || 'https://cheery-hummingbird-7ecc95.netlify.app'}/api/oauth-callback`;

      if (!clientId) {
        return {
          statusCode: 503,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'LinkedIn OAuth is not configured on the server. LINKEDIN_CLIENT_ID must be set in Netlify environment variables.',
            configured: false,
          }),
        };
      }

      const state = generateOAuthState(user.uid, 'linkedin');
      const scopes = encodeURIComponent('openid profile email w_member_social');
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scopes}`;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUrl,
          state,
          platform: 'linkedin',
        }),
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Platform '${platform}' direct OAuth is coming in Phase B.` }),
    };
  } catch (err: any) {
    console.error('[OAuthInit] Failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Failed to initialize OAuth' }),
    };
  }
};
