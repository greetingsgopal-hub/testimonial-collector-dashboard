import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { decryptToken } from '../lib/crypto';
import { getDocument, saveDocument, queryUserDocuments } from '../lib/firestoreAdmin';
import { getSocialProvider } from '../lib/providers';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

const ALLOWED_PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram'];
const MAX_CAPTION_LENGTH = 3000;

export async function handleSocialPublish(request: Request, env: WorkerEnv): Promise<Response> {
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
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Valid Panda Praise session required.' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Rate Limiting: Max 15 publish attempts per minute per user
  const rateCheck = checkRateLimit(`publish_${user.uid}`, 15, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many publish requests. Please wait a moment.' }),
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

    const { reviewId, platform, caption, mediaBase64 } = body;

    if (!reviewId || !platform || !caption) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters (reviewId, platform, caption).' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cleanPlatform = String(platform).trim().toLowerCase();
    if (!ALLOWED_PLATFORMS.includes(cleanPlatform)) {
      return new Response(
        JSON.stringify({ error: `Platform '${cleanPlatform}' is not supported.` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (typeof caption !== 'string' || caption.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Caption must be non-empty text.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (caption.length > MAX_CAPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Caption exceeds maximum permitted length of ${MAX_CAPTION_LENGTH} characters.` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Moderate & Tenant Isolation: Verify Review Ownership & Status Server-Side
    const review = await getDocument('reviews', String(reviewId), idToken, env);
    if (!review) {
      return new Response(JSON.stringify({ error: 'Testimonial not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (review.ownerId !== user.uid) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this testimonial.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (review.status !== 'approved') {
      return new Response(
        JSON.stringify({
          error: `Testimonial is currently "${review.status}". Only approved testimonials can be published to social media.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Fetch User's Social Connection
    const connectionId = `${user.uid}_${cleanPlatform}`;
    const connection = await getDocument('social_connections', connectionId, idToken, env);

    if (!connection || connection.status !== 'connected' || !connection.accessTokenEncrypted) {
      return new Response(
        JSON.stringify({
          error: `${cleanPlatform.toUpperCase()} account is not connected. Please connect your account first.`,
          reauthRequired: true,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check token expiration
    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({
          error: `Your ${cleanPlatform.toUpperCase()} connection has expired. Please reconnect your account.`,
          reauthRequired: true,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Double-Click / Idempotency Protection: Check recent publications within 15 seconds
    const existingPubs = await queryUserDocuments('social_publications', user.uid, idToken, env);
    const recentDuplicate = existingPubs.find((p) => {
      if (p.reviewId === reviewId && p.platform === cleanPlatform && p.status === 'published') {
        const pubTime = new Date(p.publishedAt || p.createdAt).getTime();
        return Date.now() - pubTime < 15 * 1000;
      }
      return false;
    });

    if (recentDuplicate) {
      return new Response(
        JSON.stringify({
          success: true,
          platform: cleanPlatform,
          postId: recentDuplicate.platformPostId,
          postUrl: recentDuplicate.platformPostUrl,
          publishedAt: recentDuplicate.publishedAt,
          message: 'Already published moments ago.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Decrypt Access Token securely in memory
    const accessToken = decryptToken(connection.accessTokenEncrypted, env);
    const authorUrn = connection.platformUserId;

    if (!accessToken || !authorUrn) {
      return new Response(
        JSON.stringify({
          error: 'Invalid connection credentials on file. Reconnection required.',
          reauthRequired: true,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Publish to Platform API via Provider Abstraction
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

    await saveDocument('social_publications', pubId, publicationRecord, idToken, env);

    return new Response(
      JSON.stringify({
        success: true,
        platform: cleanPlatform,
        postId: publishResult.postId,
        postUrl: publishResult.postUrl,
        publishedAt: now,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[SocialPublish] Publishing failed:', err?.message || err);
    const isAuthErr = err?.message?.includes('expired') || err?.message?.includes('revoked') || err?.message?.includes('401');
    return new Response(
      JSON.stringify({
        error: isAuthErr
          ? 'Social platform authentication expired or was revoked. Please reconnect your account.'
          : 'Failed to publish post to social platform. Please try again.',
        reauthRequired: isAuthErr,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
