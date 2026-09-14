import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { decryptToken } from './_shared/crypto';
import { getDocument, saveDocument, queryUserDocuments } from './_shared/firestoreAdmin';
import { getSocialProvider } from './_shared/providers';
import { getCorsHeaders, handleOptionsPreflight } from './_shared/cors';
import { checkRateLimit } from './_shared/rateLimit';

const ALLOWED_PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram'];
const MAX_CAPTION_LENGTH = 3000;

export const handler: Handler = async (event) => {
  // Handle CORS Preflight
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
      body: JSON.stringify({ error: 'Unauthorized: Valid Panda Praise session required.' }),
    };
  }

  // Rate Limiting: Max 15 publish attempts per minute per user
  const rateCheck = checkRateLimit(`publish_${user.uid}`, 15, 60000);
  if (!rateCheck.allowed) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many publish requests. Please wait a moment.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { reviewId, platform, caption, mediaBase64 } = body;

    if (!reviewId || !platform || !caption) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters (reviewId, platform, caption).' }),
      };
    }

    const cleanPlatform = String(platform).trim().toLowerCase();
    if (!ALLOWED_PLATFORMS.includes(cleanPlatform)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Platform '${cleanPlatform}' is not supported.` }),
      };
    }

    if (typeof caption !== 'string' || caption.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Caption must be non-empty text.' }),
      };
    }

    if (caption.length > MAX_CAPTION_LENGTH) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Caption exceeds maximum permitted length of ${MAX_CAPTION_LENGTH} characters.` }),
      };
    }

    // 1. Moderate & Tenant Isolation: Verify Review Ownership & Status Server-Side
    const review = await getDocument('reviews', String(reviewId), idToken);
    if (!review) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Testimonial not found.' }),
      };
    }

    if (review.ownerId !== user.uid) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Forbidden: You do not own this testimonial.' }),
      };
    }

    if (review.status !== 'approved') {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Testimonial is currently "${review.status}". Only approved testimonials can be published to social media.`,
        }),
      };
    }

    // 2. Fetch User's Social Connection
    const connectionId = `${user.uid}_${cleanPlatform}`;
    const connection = await getDocument('social_connections', connectionId, idToken);

    if (!connection || connection.status !== 'connected' || !connection.accessTokenEncrypted) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `${cleanPlatform.toUpperCase()} account is not connected. Please connect your account first.`,
          reauthRequired: true,
        }),
      };
    }

    // Check token expiration
    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt).getTime() < Date.now()) {
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Your ${cleanPlatform.toUpperCase()} connection has expired. Please reconnect your account.`,
          reauthRequired: true,
        }),
      };
    }

    // 3. Double-Click / Idempotency Protection: Check recent publications within 15 seconds
    const existingPubs = await queryUserDocuments('social_publications', user.uid, idToken);
    const recentDuplicate = existingPubs.find((p) => {
      if (p.reviewId === reviewId && p.platform === cleanPlatform && p.status === 'published') {
        const pubTime = new Date(p.publishedAt || p.createdAt).getTime();
        return Date.now() - pubTime < 15 * 1000; // 15 seconds duplicate debounce
      }
      return false;
    });

    if (recentDuplicate) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          platform: cleanPlatform,
          postId: recentDuplicate.platformPostId,
          postUrl: recentDuplicate.platformPostUrl,
          publishedAt: recentDuplicate.publishedAt,
          message: 'Already published moments ago.',
        }),
      };
    }

    // 4. Decrypt Access Token securely in memory
    const accessToken = decryptToken(connection.accessTokenEncrypted);
    const authorUrn = connection.platformUserId;

    if (!accessToken || !authorUrn) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid connection credentials on file. Reconnection required.', reauthRequired: true }),
      };
    }

    // 5. Publish to Platform API via Provider Abstraction (PII strictly excluded)
    const provider = getSocialProvider(cleanPlatform);
    const publishResult = await provider.publish({
      accessToken,
      platformAccountId: authorUrn,
      commentary: caption,
      mediaBase64: typeof mediaBase64 === 'string' && mediaBase64.startsWith('data:image/') ? mediaBase64 : undefined,
    });

    // 6. Save Audit Record in social_publications
    const pubId = `pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const publicationRecord = {
      ownerId: user.uid,
      reviewId: review.id,
      testimonialAuthor: review.name,
      platform: cleanPlatform,
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        platform: cleanPlatform,
        postId: publishResult.postId,
        postUrl: publishResult.postUrl,
        publishedAt: now,
      }),
    };
  } catch (err: any) {
    console.error('[SocialPublish] Publishing failed:', err?.message || err);
    const isAuthErr = err?.message?.includes('expired') || err?.message?.includes('revoked') || err?.message?.includes('401');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: isAuthErr
          ? 'Social platform authentication expired or was revoked. Please reconnect your account.'
          : 'Failed to publish post to social platform. Please try again.',
        reauthRequired: isAuthErr,
      }),
    };
  }
};
