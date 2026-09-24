import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getDocument, queryUserDocuments } from '../lib/firestoreAdmin';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleSocialStatus(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'GET') {
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

  // Rate Limiting: Max 40 requests per minute per user
  const rateCheck = checkRateLimit(`status_${user.uid}`, 40, 60000);
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
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const connectionDocs = await Promise.all(
      platforms.map((p) => getDocument('social_connections', `${user.uid}_${p}`, idToken, env))
    );

    // Build sanitized connections map — NEVER expose accessToken or refreshToken
    const connections: Record<string, any> = {
      linkedin: { connected: false },
      twitter: { connected: false },
      facebook: { connected: false },
      instagram: { connected: false },
    };

    for (const conn of connectionDocs) {
      if (conn && conn.platform && connections[conn.platform]) {
        const isExpired = conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt).getTime() < Date.now() : false;
        connections[conn.platform] = {
          connected: conn.status === 'connected' && !isExpired,
          status: isExpired ? 'expired' : conn.status,
          accountName: conn.platformAccountName || 'Connected Account',
          profilePicture: conn.platformProfilePicture || null,
          connectedAt: conn.connectedAt || conn.createdAt,
          tokenExpiresAt: conn.tokenExpiresAt,
        };
      }
    }

    let publications: any[] = [];
    try {
      const rawPublications = await queryUserDocuments('social_publications', user.uid, idToken, env);
      publications = rawPublications
        .map((pub) => ({
          id: pub.id,
          reviewId: pub.reviewId,
          testimonialAuthor: pub.testimonialAuthor,
          platform: pub.platform,
          platformPostId: pub.platformPostId,
          platformPostUrl: pub.platformPostUrl,
          status: pub.status,
          caption: pub.caption,
          mediaType: pub.mediaType,
          publishedAt: pub.publishedAt || pub.createdAt,
          errorCode: pub.errorCode,
          errorMessage: pub.errorMessage,
        }))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (e) {
      console.warn('[SocialStatus] Could not fetch publications:', e);
    }

    return new Response(
      JSON.stringify({
        connections,
        publications,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[SocialStatus] Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to retrieve social status.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
