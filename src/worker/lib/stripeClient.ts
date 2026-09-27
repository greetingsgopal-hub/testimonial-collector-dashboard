import Stripe from 'stripe';
import { WorkerEnv } from '../types';
import { getDocument, saveDocument } from './firestoreAdmin';

/**
 * Stripe client for PandaPraise subscription billing.
 * All operations are server-side only — never expose STRIPE_SECRET_KEY to frontend.
 */

let stripeInstance: Stripe | null = null;

export function getStripeClient(env: WorkerEnv): Stripe {
  if (!stripeInstance && env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  if (!stripeInstance) {
    throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured.');
  }
  return stripeInstance;
}

/**
 * Price ID to plan tier mapping.
 * Configure these in Stripe Dashboard and set as Worker vars.
 */
export function getPricePlanTier(priceId: string, env: WorkerEnv): 'starter' | 'pro' | null {
  const starterPrices = [
    env.STRIPE_PRICE_STARTER_MONTHLY,
    env.STRIPE_PRICE_STARTER_ANNUAL,
  ].filter(Boolean);
  const proPrices = [
    env.STRIPE_PRICE_PRO_MONTHLY,
    env.STRIPE_PRICE_PRO_ANNUAL,
  ].filter(Boolean);

  if (starterPrices.includes(priceId)) return 'starter';
  if (proPrices.includes(priceId)) return 'pro';
  return null;
}

/**
 * Create a Stripe Customer for a workspace if one doesn't exist.
 * Returns the existing customer ID if already created.
 */
export async function getOrCreateStripeCustomer(
  workspaceId: string,
  workspaceData: any,
  email: string,
  env: WorkerEnv
): Promise<string> {
  const stripe = getStripeClient(env);

  // Return existing customer ID if already created
  if (workspaceData.stripeCustomerId) {
    return workspaceData.stripeCustomerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      workspaceId,
    },
  });

  // Store customer ID in workspace
  await saveDocument('workspaces', workspaceId, {
    stripeCustomerId: customer.id,
    updatedAt: new Date().toISOString(),
  }, undefined, env);

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for subscription purchase.
 */
export async function createCheckoutSession(
  workspaceId: string,
  customerId: string,
  priceId: string,
  env: WorkerEnv
): Promise<string> {
  const stripe = getStripeClient(env);
  const origin = 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard/settings?checkout_success=true`,
    cancel_url: `${origin}/dashboard/settings?checkout_canceled=true`,
    metadata: {
      workspaceId,
    },
    subscription_data: {
      metadata: {
        workspaceId,
      },
    },
  });

  return session.url || '';
}

/**
 * Create a Stripe Billing Portal session for subscription management.
 */
export async function createBillingPortalSession(
  customerId: string,
  env: WorkerEnv
): Promise<string> {
  const stripe = getStripeClient(env);
  const origin = 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/settings`,
  });

  return session.url;
}

/**
 * Verify Stripe webhook signature using the raw body.
 * Returns the verified event or throws.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  env: WorkerEnv
): Stripe.Event {
  const stripe = getStripeClient(env);
  const secret = env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('[Stripe] STRIPE_WEBHOOK_SECRET is not configured.');
  }
  if (!signature) {
    throw new Error('[Stripe] Missing Stripe-Signature header.');
  }

  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Check if a Stripe event has already been processed (idempotency).
 * Store event IDs in a dedicated collection to prevent double-processing.
 */
export async function isEventProcessed(eventId: string, env: WorkerEnv): Promise<boolean> {
  const doc = await getDocument('stripe_events', eventId, undefined, env);
  return doc !== null;
}

/**
 * Mark a Stripe event as processed.
 */
export async function markEventProcessed(eventId: string, env: WorkerEnv): Promise<void> {
  await saveDocument('stripe_events', eventId, {
    processedAt: new Date().toISOString(),
  }, undefined, env);
}

/**
 * Update workspace subscription status from Stripe data.
 */
export async function updateWorkspaceSubscription(
  workspaceId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    plan?: 'free' | 'starter' | 'pro';
    currentPeriodEnd?: string;
  },
  env: WorkerEnv
): Promise<void> {
  await saveDocument('workspaces', workspaceId, {
    ...data,
    updatedAt: new Date().toISOString(),
  }, undefined, env);
}
/**
 * Get workspace by Stripe customer ID (for webhook processing).
 * Uses Firestore REST API runQuery endpoint.
 */
export async function getWorkspaceByCustomerId(
  customerId: string,
  env: WorkerEnv
): Promise<{ id: string; data: any } | null> {
  const projectId = env.FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'workspaces' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'stripeCustomerId' },
            op: 'EQUAL',
            value: { stringValue: customerId },
          },
        },
        limit: 1,
      },
    }),
  });

  if (!res.ok) {
    console.error('[Stripe] Failed to query workspace by customerId:', res.status);
    return null;
  }

  const results = await res.json();
  if (!results || results.length === 0 || !results[0].document) {
    return null;
  }

  const doc = results[0].document;
  const workspaceId = doc.name.split('/').pop();
  const data: any = {};

  // Convert Firestore document fields to plain object
  const fields = (doc.fields || {}) as Record<string, Record<string, unknown>>;
  for (const [key, value] of Object.entries(fields)) {
    data[key] = Object.values(value)[0];
  }

  return { id: workspaceId, data };
}
