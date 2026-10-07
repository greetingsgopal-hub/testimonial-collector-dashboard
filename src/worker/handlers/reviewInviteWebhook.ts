import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

/**
 * Inbound Webhook Trigger for Automated Review Collection.
 * Allows external platforms (Stripe, Zapier, Make, Shopify, or custom apps)
 * to trigger personalized review requests for customers post-purchase or milestone.
 */
export async function handleReviewInviteWebhook(request: Request, _env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const email = (body.customerEmail || body.email || '').trim();
  const name = (body.customerName || body.name || '').trim();
  const slug = (body.spaceSlug || body.slug || 'feedback').trim().toLowerCase();
  const source = (body.triggerSource || body.source || 'webhook').trim();
  const orderId = body.orderId || body.referenceId || null;

  // Basic email validation
  if (!email || !email.includes('@')) {
    return new Response(
      JSON.stringify({
        error: 'Missing or invalid customerEmail. A valid email address is required.',
        expectedFormat: {
          customerEmail: 'customer@example.com',
          customerName: 'Alex Rivera (optional)',
          spaceSlug: 'feedback (optional)',
          triggerSource: 'stripe_purchase (optional)',
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const originUrl = new URL(request.url).origin || 'https://pandapraise.com';
  const queryParams = new URLSearchParams();
  queryParams.set('email', email);
  if (name) queryParams.set('name', name);
  if (orderId) queryParams.set('ref', orderId);

  const inviteUrl = `${originUrl}/c/${encodeURIComponent(slug)}?${queryParams.toString()}`;

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Automated review collection trigger accepted.',
      inviteUrl,
      customer: {
        email,
        name: name || undefined,
        spaceSlug: slug,
        triggerSource: source,
        orderId: orderId || undefined,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
