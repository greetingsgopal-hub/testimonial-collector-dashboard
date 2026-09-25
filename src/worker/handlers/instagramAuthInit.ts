import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { generateOAuthState } from '../lib/crypto';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { buildInstagramAuthUrl } from '../lib/instagramOAuth';

export async function handleInstagramAuthInit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate Limiting: Max 15 OAuth init attempts per minute per IP
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`instagram_auth_init_${clientIp}`, 15, 60000);
  if (!rateCheck.allowed) {
    if (request.method === 'GET') {
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Too many requests. Please wait a minute.')}`,
        302
      );
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
  let userId = 'user_demo_gopal';
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) {
      userId = user.uid;
    }
  } else if (url.searchParams.get('uid')) {
    userId = url.searchParams.get('uid') || userId;
  }

  const appId = env.META_APP_ID;
  const redirectUri = env.INSTAGRAM_REDIRECT_URI || `${baseUrl}/api/auth/instagram/callback`;

  // Generate cryptographically signed CSRF state token
  const state = generateOAuthState(userId, 'instagram', env);

  if (!appId) {
    console.warn('[InstagramAuthInit] META_APP_ID not configured in Worker environment.');
    if (request.method === 'GET') {
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_connected=instagram&account_name=${encodeURIComponent('@pandapraise_official')}&notice=${encodeURIComponent('Meta App ID placeholder mode active')}`,
        302
      );
    }

    return new Response(
      JSON.stringify({
        error: 'META_APP_ID is not configured in Worker environment variables.',
        configured: false,
        authUrl: `${baseUrl}/dashboard/integrate?social_connected=instagram`,
        state,
        platform: 'instagram',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const authUrl = buildInstagramAuthUrl(state, appId, redirectUri);

  if (request.method === 'GET') {
    return Response.redirect(authUrl, 302);
  }

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
