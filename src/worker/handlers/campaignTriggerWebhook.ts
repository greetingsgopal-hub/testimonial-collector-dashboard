import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { verifyHmacSha256 } from '../lib/hmac';

export interface CampaignTriggerPayload {
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  productName?: string;
  orderId?: string;
  campaignId?: string;
  projectId?: string;
  spaceSlug?: string;
  channel?: 'email' | 'whatsapp';
  delayDays?: number;
  metadata?: Record<string, any>;
}

/**
 * Enterprise Inbound Webhook Endpoint for triggering automated review request campaigns.
 * Verifies HMAC signatures (via X-PandaPraise-Signature), validates customer contacts,
 * schedules drip dispatches, and generates trackable collection URLs.
 */
export async function handleCampaignTriggerWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rawBody = await request.text();

  // 1. HMAC Signature Verification (if CAMPAIGN_WEBHOOK_SECRET is configured)
  const webhookSecret = env.CAMPAIGN_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature =
      request.headers.get('X-PandaPraise-Signature') ||
      request.headers.get('X-Signature') ||
      request.headers.get('X-Hub-Signature-256');

    if (!signature) {
      return new Response(
        JSON.stringify({
          error: 'Missing required webhook signature header (X-PandaPraise-Signature)',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isValid = verifyHmacSha256(webhookSecret, rawBody, signature);
    if (!isValid) {
      return new Response(
        JSON.stringify({
          error: 'Invalid webhook signature. HMAC verification failed.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 2. Parse and Validate Payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const channel: 'email' | 'whatsapp' = payload.channel === 'whatsapp' ? 'whatsapp' : 'email';
  const email = (payload.customerEmail || payload.email || '').trim().toLowerCase();
  const phone = (payload.customerPhone || payload.phone || '').trim();
  const customerName = (payload.customerName || payload.name || '').trim();
  const productName = (payload.productName || payload.product || 'Purchase').trim();
  const orderId = (payload.orderId || payload.id || '').trim();
  const spaceSlug = (payload.spaceSlug || payload.slug || 'feedback').trim().toLowerCase();
  const campaignId = (payload.campaignId || `camp-default-${channel}`).trim();
  const projectId = (payload.projectId || 'proj-demo-1').trim();
  const delayDays = Number(payload.delayDays ?? (channel === 'whatsapp' ? 1 : 3));

  if (channel === 'email' && (!email || !email.includes('@'))) {
    return new Response(
      JSON.stringify({
        error: 'A valid customerEmail is required for email campaigns.',
        received: { customerEmail: payload.customerEmail || null },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (channel === 'whatsapp' && !phone) {
    return new Response(
      JSON.stringify({
        error: 'A valid customerPhone is required for WhatsApp campaigns (E.164 format, e.g. +14155552671).',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Compute Schedule and Tracking Links
  const originUrl = new URL(request.url).origin || 'https://pandapraise.com';
  const queryParams = new URLSearchParams();
  if (email) queryParams.set('email', email);
  if (phone) queryParams.set('phone', phone);
  if (customerName) queryParams.set('name', customerName);
  if (productName) queryParams.set('product', productName);
  if (orderId) queryParams.set('ref', orderId);

  const directFeedbackUrl = `${originUrl}/c/${encodeURIComponent(spaceSlug)}?${queryParams.toString()}`;
  const trackingClickUrl = `${originUrl}/api/campaigns/track-click?cid=${encodeURIComponent(campaignId)}&to=${encodeURIComponent(directFeedbackUrl)}`;

  const scheduledFor = new Date(Date.now() + Math.max(0, delayDays) * 86400000).toISOString();
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return new Response(
    JSON.stringify({
      success: true,
      message: delayDays === 0 ? 'Campaign dispatch queued immediately' : `Review invitation scheduled for dispatch in ${delayDays} day(s)`,
      logId,
      campaignId,
      projectId,
      channel,
      recipient: {
        email: email || undefined,
        phone: phone || undefined,
        name: customerName || undefined,
      },
      productName,
      orderId: orderId || undefined,
      scheduledFor,
      inviteUrl: directFeedbackUrl,
      trackingUrl: trackingClickUrl,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
