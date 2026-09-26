import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { transformFacebookWebhookPayload } from '../lib/facebookOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
import crypto from 'node:crypto';

/**
 * Verify Meta's X-Hub-Signature-256 header against the exact raw request body.
 * Format: "sha256=<hex hmac of appSecret over raw body>".
 * Uses timingSafeEqual to prevent timing attacks. Fails closed when
 * META_APP_SECRET is not configured.
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null, env: WorkerEnv): boolean {
  const appSecret = env.META_APP_SECRET;
  if (!appSecret) {
    console.error('[FacebookWebhook] META_APP_SECRET is not configured. Rejecting webhook (fail closed).');
    return false;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
  const provided = signatureHeader.slice('sha256='.length);

  // Both must be valid hex of equal length before timing-safe compare
  if (provided.length !== expected.length || !/^[0-9a-f]+$/i.test(provided)) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}

export async function handleFacebookWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  const url = new URL(request.url);

  // 1. Meta Webhook Verification Request (GET)
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Fail closed: no hardcoded fallback. If the token is not configured,
    // subscription verification must not succeed.
    const expectedToken = env.META_WEBHOOK_VERIFY_TOKEN;
    if (!expectedToken) {
      console.error('[FacebookWebhook] META_WEBHOOK_VERIFY_TOKEN is not configured. Rejecting verification (fail closed).');
      return new Response('Forbidden', { status: 403 });
    }

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[FacebookWebhook] Verification challenge succeeded.');
      return new Response(challenge || 'OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('[FacebookWebhook] Verification failed. Token mismatch.');
    return new Response('Forbidden', { status: 403 });
  }

  // 2. Incoming Webhook Push Notification (POST)
  if (request.method === 'POST') {
    try {
      // C2: authenticate the webhook before trusting anything.
      // Meta signs the exact raw bytes of the body — read as text, verify, then parse.
      const rawBody = await request.text();
      const signatureHeader = request.headers.get('X-Hub-Signature-256');

      if (!verifyMetaSignature(rawBody, signatureHeader, env)) {
        return new Response(JSON.stringify({ error: 'Invalid webhook signature.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let payload: any = null;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = null;
      }
      if (!payload || payload.object !== 'page') {
        return new Response('Not a page event', { status: 400 });
      }

      const reviews = transformFacebookWebhookPayload(payload);
      const now = new Date().toISOString();

      for (const rev of reviews) {
        const testimonialDoc = {
          ownerId: 'user_demo_gopal', // In production resolved from pageId binding
          author: rev.authorName,
          avatar: rev.authorAvatar,
          rating: rev.rating,
          text: rev.text,
          source: 'facebook',
          verified: true,
          status: 'approved',
          pageId: rev.pageId,
          postUrl: rev.postUrl,
          createdAt: rev.date,
          importedAt: now,
        };

        await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch((e) =>
          console.warn('[FacebookWebhook] Testimonial insert failed:', e)
        );
      }

      console.log(`[FacebookWebhook] Processed ${reviews.length} new testimonials via real-time Meta push.`);

      return new Response(JSON.stringify({ status: 'EVENT_RECEIVED', processed: reviews.length }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('[FacebookWebhook] Internal error processing webhook:', err);
      return new Response(JSON.stringify({ error: 'Failed to process event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
