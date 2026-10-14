import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { queryUserDocuments } from '../lib/firestoreAdmin';
import { createRazorpaySubscription, createRazorpayOrder } from '../lib/razorpayClient';

/**
 * Create a Razorpay checkout session (Subscription or One-time Order).
 * POST /api/razorpay/checkout
 * Body: { plan: 'monthly' | 'annual' | 'founding', planId?: string }
 * Requires: Bearer token (Firebase Auth)
 */
export async function handleRazorpayCheckout(request: Request, env: WorkerEnv): Promise<Response> {
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

  const planInput = body.plan || body.priceId || body.tier;
  if (!planInput || typeof planInput !== 'string') {
    return new Response(JSON.stringify({ error: 'plan is required (monthly, annual, founding).' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const normalizedPlan = planInput.toLowerCase().trim();
  const validPlans = ['monthly', 'annual', 'founding', 'starter', 'pro'];
  if (!validPlans.includes(normalizedPlan) && !body.planId) {
    return new Response(JSON.stringify({ error: `Invalid plan: ${planInput}. Must be monthly, annual, or founding.` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Resolve user workspace by ownerId
  const workspaces = await queryUserDocuments('workspaces', user.uid, undefined, env);
  const workspace = workspaces[0];
  const workspaceId = workspace?.id;
  if (!workspaceId) {
    return new Response(JSON.stringify({ error: 'Workspace not found.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const email = user.email || user.uid;

  try {
    // 1. Founding Lifetime Order (One-Time Payment via Orders API)
    if (normalizedPlan === 'founding') {
      const amountPaise = parseInt(env.RAZORPAY_FOUNDING_AMOUNT || '1199900', 10); // ₹11,999 default
      const order = await createRazorpayOrder(
        {
          amount: amountPaise,
          currency: 'INR',
          receipt: `fnd_${workspaceId.slice(0, 10)}_${Date.now()}`,
          notes: {
            workspaceId,
            ownerId: user.uid,
            email,
            plan: 'founding',
          },
        },
        env
      );

      return new Response(
        JSON.stringify({
          type: 'order',
          keyId: env.RAZORPAY_KEY_ID,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency || 'INR',
          workspaceId,
          name: 'PandaPraise',
          description: 'Founding Member Lifetime Pro Plan',
          prefill: {
            email,
            name: (workspace.data as any)?.name || 'PandaPraise Founder',
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Subscriptions (Monthly or Annual via Subscriptions API)
    let planId = body.planId;
    if (!planId) {
      if (normalizedPlan === 'annual') {
        planId = env.RAZORPAY_PLAN_ANNUAL;
      } else {
        // monthly, starter, pro
        planId = env.RAZORPAY_PLAN_MONTHLY;
      }
    }

    if (!planId) {
      planId = `plan_${normalizedPlan}_default`;
    }

    const subscription = await createRazorpaySubscription(
      {
        planId,
        totalCount: 120, // 10 years recurring
        notes: {
          workspaceId,
          ownerId: user.uid,
          email,
          plan: normalizedPlan,
        },
      },
      env
    );

    return new Response(
      JSON.stringify({
        type: 'subscription',
        keyId: env.RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        workspaceId,
        name: 'PandaPraise',
        description: `PandaPraise Pro Subscription (${normalizedPlan})`,
        prefill: {
          email,
          name: (workspace.data as any)?.name || 'PandaPraise Member',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[RazorpayCheckout] Checkout creation error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to initiate Razorpay checkout.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
