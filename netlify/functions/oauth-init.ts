import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { generateOAuthState } from './_shared/crypto';
import { getCorsHeaders, handleOptionsPreflight } from './_shared/cors';
import { checkRateLimit } from './_shared/rateLimit';

export const handler: Handler = async (event) => {
  // Handle CORS Preflight
  const preflight = handleOptionsPreflight(event);
  if (preflight) return preflight;

  const origin = event.headers.origin || event.headers.Origin;
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const token = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(token || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized: Valid Panda Praise session required.' }),
    };
  }

  // Rate Limiting: Max 10 OAuth init attempts per minute per user
  const rateCheck = checkRateLimit(`oauth_init_${user.uid}`, 10, 60000);
  if (!rateCheck.allowed) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : 'linkedin';

    if (platform === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${event.headers.origin || 'https://cheery-hummingbird-7ecc95.netlify.app'}/api/oauth-callback`;

      if (!clientId) {
        return {
          statusCode: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUrl,
          state,
          platform: 'linkedin',
        }),
      };
    }

    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Direct OAuth for platform '${platform}' is not supported.` }),
    };
  } catch (err: any) {
    console.error('[OAuthInit] Internal error:', err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to initialize OAuth process. Please try again.' }),
    };
  }
};
