import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { decryptToken } from './_shared/crypto';
import { getDocument, saveDocument, queryUserDocuments } from './_shared/firestoreAdmin';
import { getSocialProvider } from './_shared/providers';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const idToken = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(idToken || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized: Valid Panda Praise session required.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { reviewId, platform, caption, mediaBase64 } = body;

    if (!reviewId || !platform || !caption) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters (reviewId, platform, caption).' }),
      };
    }

    // 1. Moderate & Tenant Isolation: Verify Review Ownership & Status
    const review = await getDocument('reviews', reviewId, idToken);
    if (!review) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Testimonial not found.' }),
      };
    }

    if (review.ownerId !== user.uid) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to publish this review.' }),
      };
    }

    if (review.status !== 'approved') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Testimonial is currently "${review.status}". Only approved testimonials can be published to social media.`,
        }),
      };
    }

    // 2. Fetch User's Social Connection
    const connectionId = `${user.uid}_${platform}`;
    const connection = await getDocument('social_connections', connectionId, idToken);

    if (!connection || connection.status !== 'connected' || !connection.accessTokenEncrypted) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `${platform.toUpperCase()} account is not connected. Please connect your account first.`,
          reauthRequired: true,
        }),
      };
    }

    // Check token expiration
    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt).getTime() < Date.now()) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Your ${platform.toUpperCase()} connection has expired. Please reconnect your account.`,
          reauthRequired: true,
        }),
      };
    }

    // 3. Double-Click / Idempotency Protection: Check recent publications within 15 seconds
    const existingPubs = await queryUserDocuments('social_publications', user.uid, idToken);
    const recentDuplicate = existingPubs.find((p) => {
      if (p.reviewId === reviewId && p.platform === platform && p.status === 'published') {
        const pubTime = new Date(p.publishedAt || p.createdAt).getTime();
        return Date.now() - pubTime < 15 * 1000; // 15 seconds duplicate debounce
      }
      return false;
    });

    if (recentDuplicate) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          platform,
          postId: recentDuplicate.platformPostId,
          postUrl: recentDuplicate.platformPostUrl,
          publishedAt: recentDuplicate.publishedAt,
          message: 'Already published moments ago.',
        }),
      };
    }

    // 4. Decrypt Access Token
    const accessToken = decryptToken(connection.accessTokenEncrypted);
    const authorUrn = connection.platformUserId;

    if (!accessToken || !authorUrn) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid connection credentials on file. Reconnect required.', reauthRequired: true }),
      };
    }

    // 5. Publish to Platform API via Provider Abstraction
    const provider = getSocialProvider(platform);
    const publishResult = await provider.publish({
      accessToken,
      platformAccountId: authorUrn,
      commentary: caption,
      mediaBase64,
    });

    // 6. Save Audit Record in social_publications
    const pubId = `pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const publicationRecord = {
      ownerId: user.uid,
      reviewId: review.id,
      testimonialAuthor: review.name,
      platform,
      socialConnectionId: connectionId,
      platformPostId: publishResult.postId,
      platformPostUrl: publishResult.postUrl,
      status: 'published',
      caption,
      mediaType: mediaBase64 ? 'image' : 'text',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await saveDocument('social_publications', pubId, publicationRecord, idToken);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        platform,
        postId: publishResult.postId,
        postUrl: publishResult.postUrl,
        publishedAt: now,
      }),
    };
  } catch (err: any) {
    console.error('[SocialPublish] Failed to publish:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: err.message || 'Failed to publish post to social platform.',
        reauthRequired: err.message?.includes('expired') || err.message?.includes('revoked') || err.message?.includes('401'),
      }),
    };
  }
};
