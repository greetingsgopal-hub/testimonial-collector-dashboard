import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { generateOAuthState } from '../lib/crypto';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { buildFacebookAuthUrl } from '../lib/facebookOAuth';
import { buildInstagramAuthUrl } from '../lib/instagramOAuth';

export async function handleOAuthInit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = extractBearerToken(request.headers.get('Authorization'));
  const user = await verifyFirebaseToken(token || '', env);

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Valid Panda Praise session required.' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Rate Limiting: Max 10 OAuth init attempts per minute per user
  const rateCheck = checkRateLimit(`oauth_init_${user.uid}`, 10, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : 'linkedin';

    if (platform === 'linkedin') {
      const clientId = env.LINKEDIN_CLIENT_ID;
      const redirectUri =
        env.LINKEDIN_REDIRECT_URI ||
        `${new URL(request.url).origin}/api/oauth-callback`;

      if (!clientId) {
        return new Response(
          JSON.stringify({
            error: 'LinkedIn OAuth is not configured on the server. LINKEDIN_CLIENT_ID must be set in Worker environment variables.',
            configured: false,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const state = generateOAuthState(user.uid, 'linkedin', env);
      const scopes = encodeURIComponent('openid profile email w_member_social');
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scopes}`;

      return new Response(
        JSON.stringify({
          authUrl,
          state,
          platform: 'linkedin',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (platform === 'google') {
      const clientId = env.GOOGLE_CLIENT_ID;
      const redirectUri =
        env.GOOGLE_REDIRECT_URI ||
        `${new URL(request.url).origin}/api/auth/google/callback`;

      const state = generateOAuthState(user.uid, 'google', env);

      if (!clientId) {
        return new Response(
          JSON.stringify({
            error: 'Google OAuth is not configured on the server. GOOGLE_CLIENT_ID must be set in Worker environment variables.',
            configured: false,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const scopes = encodeURIComponent('openid profile email https://www.googleapis.com/auth/business.manage');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scopes}&access_type=offline&prompt=consent`;

      return new Response(
        JSON.stringify({
          authUrl,
          state,
          platform: 'google',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (platform === 'facebook') {
      const appId = (env.META_APP_ID || '').trim();
      const redirectUri = (
        env.FACEBOOK_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/facebook/callback`
      ).trim();

      if (!appId) {
        return new Response(
          JSON.stringify({
            error: 'Facebook OAuth is not configured on the server. META_APP_ID must be set in Worker environment variables.',
            configured: false,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const state = generateOAuthState(user.uid, 'facebook', env);
      const authUrl = buildFacebookAuthUrl(state, appId, redirectUri);

      return new Response(
        JSON.stringify({
          authUrl,
          state,
          platform: 'facebook',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (platform === 'instagram') {
      const appId = env.META_APP_ID;
      const redirectUri =
        env.INSTAGRAM_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/instagram/callback`;

      if (!appId) {
        return new Response(
          JSON.stringify({
            error: 'Instagram OAuth is not configured on the server. META_APP_ID must be set in Worker environment variables.',
            configured: false,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const state = generateOAuthState(user.uid, 'instagram', env);
      const authUrl = buildInstagramAuthUrl(state, appId, redirectUri);

      return new Response(
        JSON.stringify({
          authUrl,
          state,
          platform: 'instagram',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: `Direct OAuth for platform '${platform}' is not supported.` }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[OAuthInit] Internal error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to initialize OAuth process. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
