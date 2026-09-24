import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { deleteDocument } from '../lib/firestoreAdmin';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

const ALLOWED_PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram'];

export async function handleSocialDisconnect(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const idToken = extractBearerToken(request.headers.get('Authorization'));
  const user = await verifyFirebaseToken(idToken || '', env);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate Limiting: Max 20 disconnect requests per minute per user
  const rateCheck = checkRateLimit(`disconnect_${user.uid}`, 20, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
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

    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : '';

    if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
      return new Response(JSON.stringify({ error: 'Invalid or unsupported platform.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const connectionId = `${user.uid}_${platform}`;
    await deleteDocument('social_connections', connectionId, idToken, env);

    return new Response(
      JSON.stringify({ success: true, platform, message: `Disconnected ${platform} account successfully.` }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[SocialDisconnect] Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to disconnect account. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
