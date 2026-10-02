import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { transformFacebookWebhookPayload } from '../lib/facebookOAuth';
import { queryDocumentsByField } from '../lib/firestoreAdmin';
import { resolveUserOwnership, isDuplicate, validateExternalId, saveReviewsBatch } from '../lib/firestore';
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

    // Timing-safe comparison for the verify token (matches the HMAC path).
    const tokenMatches =
      typeof token === 'string' &&
      token.length === expectedToken.length &&
      crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expectedToken, 'utf8'));
    if (mode === 'subscribe' && tokenMatches) {
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

      for (const rev of reviews) {
        if (!rev.pageId) {
          console.warn(`[FacebookWebhook] Review ${rev.id} has no pageId. Skipping.`);
          continue;
        }
        // Resolve the tenant owner by looking up which connected account owns
        // this page. Unbound pages are skipped — never attributed to a demo user.
        const connections = await queryDocumentsByField('social_connections', 'pageId', rev.pageId, undefined, env);
        const owner = connections.find((c: any) => c.ownerId && c.status === 'connected');
        if (!owner) {
          console.warn(`[FacebookWebhook] No connected account found for page ${rev.pageId}. Skipping review ${rev.id}.`);
          continue;
        }

        // Write to the canonical `reviews` collection (nothing reads
        // `testimonials`) with tenant-scoped dedupe so webhook replays are
        // idempotent.
        try {
          const externalId = validateExternalId(rev.id);
          if (!(await isDuplicate(owner.ownerId, 'facebook', externalId, env))) {
            const ownership = await resolveUserOwnership(owner.ownerId, undefined, env);
            await saveReviewsBatch(
              owner.ownerId,
              ownership.workspaceId,
              ownership.projectId,
              'facebook',
              rev.pageId,
              [
                {
                  author: rev.authorName,
                  avatarUrl: rev.authorAvatar,
                  rating: typeof rev.rating === 'number' ? rev.rating : 5,
                  text: rev.text,
                  createdAt: rev.date,
                  externalId,
                  sourceUrl: rev.postUrl || `https://facebook.com/${rev.pageId}`,
                },
              ],
              env
            );
          }
        } catch (e) {
          console.warn('[FacebookWebhook] Review insert failed:', e);
        }
      }

      console.log(`[FacebookWebhook] Processed webhook entries for ${reviews.length} reviews (bound pages only).`);

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
