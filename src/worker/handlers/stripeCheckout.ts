import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { getDocument } from '../lib/firestoreAdmin';
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
} from '../lib/stripeClient';

/**
 * Create a Stripe Checkout session for subscription purchase.
 * POST /api/stripe/checkout
 * Body: { priceId: string }
 * Requires: Bearer token (Firebase Auth)
 */
export async function handleCreateCheckoutSession(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Authenticate user
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = extractBearerToken(authHeader);
  const user = await verifyFirebaseToken(token || '', env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication token.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Parse request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { priceId } = body;
  if (!priceId || typeof priceId !== 'string') {
    return new Response(JSON.stringify({ error: 'priceId is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate price ID against configured prices
  const validPrices = [
    env.STRIPE_PRICE_STARTER_MONTHLY,
    env.STRIPE_PRICE_STARTER_ANNUAL,
    env.STRIPE_PRICE_PRO_MONTHLY,
    env.STRIPE_PRICE_PRO_ANNUAL,
  ].filter(Boolean);

  if (!validPrices.includes(priceId)) {
    return new Response(JSON.stringify({ error: 'Invalid price ID.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user's workspace
  const workspaceId = user.uid; // Single-user workspace
  const workspaceDoc = await getDocument('workspaces', workspaceId, undefined, env);
  if (!workspaceDoc) {
    return new Response(JSON.stringify({ error: 'Workspace not found.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create or retrieve Stripe customer
  const email = user.email || user.uid;
  let customerId: string;
  try {
    customerId = await getOrCreateStripeCustomer(workspaceId, workspaceDoc, email, env);
  } catch (err: any) {
    console.error('[StripeCheckout] Failed to create customer:', err);
    return new Response(JSON.stringify({ error: 'Failed to create Stripe customer.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create checkout session
  let checkoutUrl: string;
  try {
    checkoutUrl = await createCheckoutSession(workspaceId, customerId, priceId, env);
  } catch (err: any) {
    console.error('[StripeCheckout] Failed to create session:', err);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: checkoutUrl }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create a Stripe Billing Portal session for subscription management.
 * POST /api/stripe/billing-portal
 * Requires: Bearer token (Firebase Auth)
 */
export async function handleBillingPortal(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Authenticate user
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = extractBearerToken(authHeader);
  const user = await verifyFirebaseToken(token || '', env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication token.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user's workspace
  const workspaceId = user.uid;
  const workspaceDoc = await getDocument('workspaces', workspaceId, undefined, env);
  if (!workspaceDoc) {
    return new Response(JSON.stringify({ error: 'Workspace not found.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const customerId = workspaceDoc.stripeCustomerId;
  if (!customerId) {
    return new Response(JSON.stringify({ error: 'No Stripe customer found for this workspace.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create billing portal session
  let portalUrl: string;
  try {
    portalUrl = await createBillingPortalSession(customerId, env);
  } catch (err: any) {
    console.error('[StripeCheckout] Failed to create portal session:', err);
    return new Response(JSON.stringify({ error: 'Failed to create billing portal session.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: portalUrl }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Get current subscription status for the authenticated user.
 * GET /api/stripe/subscription
 * Requires: Bearer token (Firebase Auth)
 */
export async function handleGetSubscription(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Authenticate user
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = extractBearerToken(authHeader);
  const user = await verifyFirebaseToken(token || '', env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication token.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user's workspace
  const workspaceId = user.uid;
  const workspaceDoc = await getDocument('workspaces', workspaceId, undefined, env);
  if (!workspaceDoc) {
    return new Response(JSON.stringify({ error: 'Workspace not found.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Return subscription info from workspace (source of truth is Stripe, synced via webhooks)
  return new Response(
    JSON.stringify({
      plan: workspaceDoc.plan || 'free',
      subscriptionStatus: workspaceDoc.subscriptionStatus || null,
      stripeCustomerId: workspaceDoc.stripeCustomerId || null,
      stripeSubscriptionId: workspaceDoc.stripeSubscriptionId || null,
      currentPeriodEnd: workspaceDoc.currentPeriodEnd || null,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
