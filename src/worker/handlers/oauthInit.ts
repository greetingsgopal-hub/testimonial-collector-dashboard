import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { generateOAuthState } from '../lib/crypto';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

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
