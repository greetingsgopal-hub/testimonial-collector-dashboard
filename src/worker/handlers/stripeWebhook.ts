import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import {
  verifyWebhookSignature,
  isEventProcessed,
  markEventProcessed,
  updateWorkspaceSubscription,
  getWorkspaceByCustomerId,
  getPricePlanTier,
} from '../lib/stripeClient';

/**
 * Handle Stripe webhook events for subscription management.
 * Events are processed idempotently — duplicate events are ignored.
 */
export async function handleStripeWebhook(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Read raw body for signature verification (must not parse first)
  const rawBody = await request.text();
  const signature = request.headers.get('Stripe-Signature');

  let event: any;
  try {
    event = verifyWebhookSignature(rawBody, signature, env);
  } catch (err: any) {
    console.error('[StripeWebhook] Signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Idempotency check — skip already-processed events
  const eventId = event.id;
  if (await isEventProcessed(eventId, env)) {
    console.log(`[StripeWebhook] Event ${eventId} already processed, skipping.`);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const eventType = event.type;
  const data = event.data.object;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(data, env);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(data, env);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(data, env);
        break;
      }
      case 'invoice.payment_failed': {
        await handlePaymentFailed(data, env);
        break;
      }
      case 'invoice.payment_succeeded': {
        await handlePaymentSucceeded(data, env);
        break;
      }
      default: {
        console.log(`[StripeWebhook] Unhandled event type: ${eventType}`);
      }
    }

    // Mark event as processed
    await markEventProcessed(eventId, env);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[StripeWebhook] Error processing ${eventType}:`, err);
    // Don't mark as processed — allow retry
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle checkout.session.completed — new subscription purchase.
 */
async function handleCheckoutCompleted(session: any, env: WorkerEnv): Promise<void> {
  const workspaceId = session.metadata?.workspaceId;
  if (!workspaceId) {
    console.error('[StripeWebhook] checkout.session.completed missing workspaceId in metadata');
    return;
  }

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const paymentStatus = session.payment_status;

  // Get plan from line items price ID
  const priceId = session.line_items?.data?.[0]?.price?.id;
  const plan = priceId ? getPricePlanTier(priceId, env) : null;

  const updateData: any = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: paymentStatus === 'paid' ? 'active' : 'incomplete',
  };

  if (plan) {
    updateData.plan = plan;
  }

  await updateWorkspaceSubscription(workspaceId, updateData, env);
  console.log(`[StripeWebhook] Checkout completed for workspace ${workspaceId}, plan=${plan || 'unknown'}`);
}

/**
 * Handle subscription created/updated events.
 */
async function handleSubscriptionUpdated(subscription: any, env: WorkerEnv): Promise<void> {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const currentPeriodEnd = subscription.current_period_end;

  // Find workspace by customer ID
  const workspace = await getWorkspaceByCustomerId(customerId, env);
  if (!workspace) {
    console.error(`[StripeWebhook] No workspace found for customer ${customerId}`);
    return;
  }

  const plan = priceId ? getPricePlanTier(priceId, env) : null;

  const updateData: any = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: status,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
  };

  if (plan) {
    updateData.plan = plan;
  }

  await updateWorkspaceSubscription(workspace.id, updateData, env);
  console.log(`[StripeWebhook] Subscription ${subscriptionId} updated to status=${status}, plan=${plan || 'unchanged'}`);
}

/**
 * Handle subscription deleted — cancel/downgrade to free.
 */
async function handleSubscriptionDeleted(subscription: any, env: WorkerEnv): Promise<void> {
  const customerId = subscription.customer;

  const workspace = await getWorkspaceByCustomerId(customerId, env);
  if (!workspace) {
    console.error(`[StripeWebhook] No workspace found for customer ${customerId}`);
    return;
  }

  await updateWorkspaceSubscription(workspace.id, {
    subscriptionStatus: 'cancelled',
    plan: 'free',
    stripeSubscriptionId: subscription.id, // Keep for reference
  }, env);

  console.log(`[StripeWebhook] Subscription ${subscription.id} cancelled, workspace ${workspace.id} downgraded to free`);
}

/**
 * Handle payment failed — mark subscription as past_due.
 */
async function handlePaymentFailed(invoice: any, env: WorkerEnv): Promise<void> {
  const customerId = invoice.customer;

  const workspace = await getWorkspaceByCustomerId(customerId, env);
  if (!workspace) {
    console.error(`[StripeWebhook] No workspace found for customer ${customerId}`);
    return;
  }

  await updateWorkspaceSubscription(workspace.id, {
    subscriptionStatus: 'past_due',
  }, env);

  console.log(`[StripeWebhook] Payment failed for customer ${customerId}, marked as past_due`);
}

/**
 * Handle payment succeeded — restore active status if was past_due.
 */
async function handlePaymentSucceeded(invoice: any, env: WorkerEnv): Promise<void> {
  const customerId = invoice.customer;

  const workspace = await getWorkspaceByCustomerId(customerId, env);
  if (!workspace) {
    console.error(`[StripeWebhook] No workspace found for customer ${customerId}`);
    return;
  }

  // Only update if currently past_due
  if (workspace.data.subscriptionStatus === 'past_due') {
    await updateWorkspaceSubscription(workspace.id, {
      subscriptionStatus: 'active',
    }, env);
    console.log(`[StripeWebhook] Payment succeeded for customer ${customerId}, restored to active`);
  }
}
