import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { getDocument, queryUserDocuments } from './_shared/firestoreAdmin';
import { getCorsHeaders, handleOptionsPreflight } from './_shared/cors';
import { checkRateLimit } from './_shared/rateLimit';

export const handler: Handler = async (event) => {
  const preflight = handleOptionsPreflight(event);
  if (preflight) return preflight;

  const origin = event.headers.origin || event.headers.Origin;
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod !== 'GET') {
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

  // Rate Limiting: Max 40 requests per minute per user
  const rateCheck = checkRateLimit(`status_${user.uid}`, 40, 60000);
  if (!rateCheck.allowed) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
    };
  }

  try {
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const connectionDocs = await Promise.all(
      platforms.map((p) => getDocument('social_connections', `${user.uid}_${p}`, idToken))
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
      const rawPublications = await queryUserDocuments('social_publications', user.uid, idToken);
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

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connections,
        publications,
      }),
    };
  } catch (err: any) {
    console.error('[SocialStatus] Error:', err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to retrieve social status.' }),
    };
  }
};
