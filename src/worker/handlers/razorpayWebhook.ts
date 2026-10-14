import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import {
  verifyRazorpayWebhookSignature,
  isRazorpayEventProcessed,
  markRazorpayEventProcessed,
  updateWorkspaceFromRazorpay,
  getWorkspaceByRazorpaySubscriptionId,
} from '../lib/razorpayClient';

/**
 * Handle incoming Razorpay Webhook events.
 * POST /api/webhook/razorpay
 * Header: X-Razorpay-Signature
 */
export async function handleRazorpayWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  const rawBody = await request.text();
  const signature = request.headers.get('X-Razorpay-Signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing X-Razorpay-Signature header.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const isValid = await verifyRazorpayWebhookSignature(
    rawBody,
    signature,
    env.RAZORPAY_WEBHOOK_SECRET || ''
  );

  if (!isValid) {
    console.error('[RazorpayWebhook] Signature verification failed.');
    return new Response(JSON.stringify({ error: 'Invalid webhook signature.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const eventId = event.id || event.event_id || `${event.event}_${event.created_at || Date.now()}`;

  // Idempotency check: Skip duplicate events
  if (await isRazorpayEventProcessed(eventId, env)) {
    console.log(`[RazorpayWebhook] Event ${eventId} already processed, skipping.`);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const eventType = event.event;
  const payload = event.payload || {};

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subEntity = payload.subscription?.entity;
        if (subEntity) {
          const workspaceId =
            subEntity.notes?.workspaceId ||
            (await getWorkspaceByRazorpaySubscriptionId(subEntity.id, env))?.id;

          if (workspaceId) {
            await updateWorkspaceFromRazorpay(
              workspaceId,
              {
                plan: 'pro',
                subscriptionStatus: 'active',
                razorpaySubscriptionId: subEntity.id,
                razorpayCustomerId: subEntity.customer_id,
                billingCycle: subEntity.notes?.plan === 'annual' ? 'annual' : 'monthly',
                currentPeriodEnd: subEntity.current_end
                  ? new Date(subEntity.current_end * 1000).toISOString()
                  : undefined,
              },
              env
            );
            console.log(`[RazorpayWebhook] Subscription active for workspace ${workspaceId}`);
          }
        }
        break;
      }

      case 'subscription.pending': {
        const subEntity = payload.subscription?.entity;
        if (subEntity) {
          const workspaceId =
            subEntity.notes?.workspaceId ||
            (await getWorkspaceByRazorpaySubscriptionId(subEntity.id, env))?.id;

          if (workspaceId) {
            await updateWorkspaceFromRazorpay(
              workspaceId,
              {
                subscriptionStatus: 'pending',
              },
              env
            );
          }
        }
        break;
      }

      case 'subscription.halted': {
        const subEntity = payload.subscription?.entity;
        if (subEntity) {
          const workspaceId =
            subEntity.notes?.workspaceId ||
            (await getWorkspaceByRazorpaySubscriptionId(subEntity.id, env))?.id;

          if (workspaceId) {
            await updateWorkspaceFromRazorpay(
              workspaceId,
              {
                subscriptionStatus: 'halted',
              },
              env
            );
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        const subEntity = payload.subscription?.entity;
        if (subEntity) {
          const workspaceId =
            subEntity.notes?.workspaceId ||
            (await getWorkspaceByRazorpaySubscriptionId(subEntity.id, env))?.id;

          if (workspaceId) {
            await updateWorkspaceFromRazorpay(
              workspaceId,
              {
                plan: 'free',
                subscriptionStatus: 'cancelled',
              },
              env
            );
          }
        }
        break;
      }

      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = payload.payment?.entity || payload.order?.entity;
        if (paymentEntity) {
          const workspaceId = paymentEntity.notes?.workspaceId;
          const plan = paymentEntity.notes?.plan;

          if (workspaceId && plan === 'founding') {
            await updateWorkspaceFromRazorpay(
              workspaceId,
              {
                plan: 'pro',
                subscriptionStatus: 'active',
                billingCycle: 'lifetime',
                razorpayPaymentId: paymentEntity.id,
                razorpayOrderId: paymentEntity.order_id,
              },
              env
            );
            console.log(`[RazorpayWebhook] Founding lifetime plan activated for workspace ${workspaceId}`);
          }
        }
        break;
      }

      default: {
        console.log(`[RazorpayWebhook] Unhandled event type: ${eventType}`);
      }
    }

    // Mark event processed
    await markRazorpayEventProcessed(eventId, event, env);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[RazorpayWebhook] Error processing ${eventType}:`, err);
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
