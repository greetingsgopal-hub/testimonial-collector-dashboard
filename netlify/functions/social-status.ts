import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { getDocument, queryUserDocuments } from './_shared/firestoreAdmin';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const idToken = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(idToken || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const connectionDocs = await Promise.all(
      platforms.map((p) => getDocument('social_connections', `${user.uid}_${p}`, idToken))
    );

    // Build sanitized connections map
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connections,
        publications,
      }),
    };
  } catch (err: any) {
    console.error('[SocialStatus] Error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Failed to fetch social status' }),
    };
  }
};
