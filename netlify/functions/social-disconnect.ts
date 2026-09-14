import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { deleteDocument } from './_shared/firestoreAdmin';
import { getCorsHeaders, handleOptionsPreflight } from './_shared/cors';
import { checkRateLimit } from './_shared/rateLimit';

const ALLOWED_PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram'];

export const handler: Handler = async (event) => {
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

  const idToken = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(idToken || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  // Rate Limiting: Max 20 disconnect requests per minute per user
  const rateCheck = checkRateLimit(`disconnect_${user.uid}`, 20, 60000);
  if (!rateCheck.allowed) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : '';

    if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or unsupported platform.' }),
      };
    }

    const connectionId = `${user.uid}_${platform}`;
    await deleteDocument('social_connections', connectionId, idToken);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, platform, message: `Disconnected ${platform} account successfully.` }),
    };
  } catch (err: any) {
    console.error('[SocialDisconnect] Error:', err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to disconnect account. Please try again.' }),
    };
  }
};
