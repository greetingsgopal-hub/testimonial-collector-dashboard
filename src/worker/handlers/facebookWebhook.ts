import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { transformFacebookWebhookPayload } from '../lib/facebookOAuth';
import { saveDocument } from '../lib/firestoreAdmin';

export async function handleFacebookWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  const url = new URL(request.url);

  // 1. Meta Webhook Verification Request (GET)
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = env.META_WEBHOOK_VERIFY_TOKEN || 'pandapraise_meta_verify_token_2026';

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
      const payload: any = await request.json().catch(() => null);
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
