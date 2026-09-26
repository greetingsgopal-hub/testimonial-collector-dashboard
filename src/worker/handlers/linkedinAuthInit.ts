import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { generateOAuthState } from '../lib/crypto';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleLinkedInAuthInit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate Limiting: Max 15 OAuth init attempts per minute per IP
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`linkedin_auth_init_${clientIp}`, 15, 60000);
  if (!rateCheck.allowed) {
    if (request.method === 'GET') {
      return Response.redirect(`${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Too many requests. Please wait a minute.')}`, 302);
    }
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Resolve user identity from Authorization header or query param
  let userId: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) {
      userId = user.uid;
    }
  }

  if (!userId) {
    if (request.method === 'GET') {
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Please sign in before connecting LinkedIn.')}`,
        302
      );
    }
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientId = env.LINKEDIN_CLIENT_ID;
  const redirectUri = env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/auth/linkedin/callback`;

  // Generate cryptographically signed CSRF state token
  const state = generateOAuthState(userId, 'linkedin', env);

  if (!clientId) {
    console.warn('[LinkedInAuthInit] LINKEDIN_CLIENT_ID not configured in Worker environment.');
    if (request.method === 'GET') {
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_connected=linkedin&notice=${encodeURIComponent('LinkedIn is not configured yet. Please contact support.')}`,
        302
      );
    }

    return new Response(
      JSON.stringify({
        error: 'LINKEDIN_CLIENT_ID is not configured in Worker environment variables.',
        configured: false,
        authUrl: `${baseUrl}/dashboard/integrate?social_connected=linkedin`,
        state,
        platform: 'linkedin',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const scopes = encodeURIComponent('openid profile email w_member_social');
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scopes}`;

  if (request.method === 'GET') {
    return Response.redirect(authUrl, 302);
  }

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
