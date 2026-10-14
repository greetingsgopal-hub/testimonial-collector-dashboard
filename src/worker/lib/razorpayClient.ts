import { WorkerEnv } from '../types';
import { saveDocument } from './firestoreAdmin';
import { getServiceAccountAccessToken } from './googleAuth';

/**
 * Verify Razorpay Webhook signature using Web Crypto HMAC-SHA256.
 * Header: X-Razorpay-Signature (hex encoded HMAC-SHA256 digest of request body)
 */
export async function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(rawBody));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    if (computedSignature.length !== signature.length) {
      return false;
    }
    let match = 0;
    for (let i = 0; i < computedSignature.length; i++) {
      match |= computedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return match === 0;
  } catch (err) {
    console.error('[Razorpay] Webhook signature verification error:', err);
    return false;
  }
}

/**
 * Helper to build Razorpay Basic Auth Header.
 */
function getBasicAuthHeader(env: WorkerEnv): string {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)');
  }
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

/**
 * Create a subscription using the Razorpay Subscriptions API.
 */
export async function createRazorpaySubscription(
  params: {
    planId: string;
    totalCount?: number;
    quantity?: number;
    customerNotify?: number;
    notes?: Record<string, string>;
  },
  env: WorkerEnv
): Promise<any> {
  const authHeader = getBasicAuthHeader(env);
  const body = {
    plan_id: params.planId,
    total_count: params.totalCount || 120, // 10 years recurring
    quantity: params.quantity || 1,
    customer_notify: params.customerNotify !== undefined ? params.customerNotify : 1,
    notes: params.notes || {},
  };

  const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Razorpay subscription creation failed (${res.status}): ${errorBody}`);
  }

  return await res.json();
}

/**
 * Create a one-time order using Razorpay Orders API (for Lifetime Founding Pro).
 */
export async function createRazorpayOrder(
  params: {
    amount: number; // in paise
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  },
  env: WorkerEnv
): Promise<any> {
  const authHeader = getBasicAuthHeader(env);
  const body = {
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
  };

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Razorpay order creation failed (${res.status}): ${errorBody}`);
  }

  return await res.json();
}

/**
 * Cancel a subscription in Razorpay.
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true,
  env: WorkerEnv
): Promise<any> {
  const authHeader = getBasicAuthHeader(env);

  const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Razorpay subscription cancel failed (${res.status}): ${errorBody}`);
  }

  return await res.json();
}

/**
 * Check if a Razorpay webhook event has already been processed (Idempotency).
 */
export async function isRazorpayEventProcessed(eventId: string, env: WorkerEnv): Promise<boolean> {
  const projectId = env.FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/razorpay_events/${eventId}`;

  const headers: Record<string, string> = {};
  const saToken = await getServiceAccountAccessToken(env);
  if (saToken) {
    headers['Authorization'] = `Bearer ${saToken}`;
  }

  const res = await fetch(url, { headers });
  return res.ok;
}

/**
 * Mark a Razorpay event as processed in Firestore.
 */
export async function markRazorpayEventProcessed(
  eventId: string,
  eventData: any,
  env: WorkerEnv
): Promise<void> {
  await saveDocument(
    'razorpay_events',
    eventId,
    {
      eventId,
      eventType: eventData.type || eventData.event || 'unknown',
      processedAt: new Date().toISOString(),
    },
    undefined,
    env
  );
}

/**
 * Update workspace subscription state in Firestore.
 */
export async function updateWorkspaceFromRazorpay(
  workspaceId: string,
  data: {
    plan?: 'free' | 'starter' | 'pro';
    subscriptionStatus?: 'active' | 'past_due' | 'halted' | 'pending' | 'cancelled' | 'incomplete';
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    billingCycle?: 'monthly' | 'annual' | 'lifetime';
    currentPeriodEnd?: string;
  },
  env: WorkerEnv
): Promise<void> {
  await saveDocument(
    'workspaces',
    workspaceId,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    undefined,
    env
  );
}

/**
 * Query workspace by Razorpay subscription ID or customer ID.
 */
export async function getWorkspaceByRazorpaySubscriptionId(
  subscriptionId: string,
  env: WorkerEnv
): Promise<{ id: string; data: any } | null> {
  const projectId = env.FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const saToken = await getServiceAccountAccessToken(env);
  if (saToken) {
    headers['Authorization'] = `Bearer ${saToken}`;
  }

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'workspaces' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'razorpaySubscriptionId' },
            op: 'EQUAL',
            value: { stringValue: subscriptionId },
          },
        },
        limit: 1,
      },
    }),
  });

  if (!res.ok) {
    console.error('[Razorpay] Failed to query workspace by subscriptionId:', res.status);
    return null;
  }

  const results = await res.json();
  if (!results || results.length === 0 || !results[0].document) {
    return null;
  }

  const doc = results[0].document;
  const workspaceId = doc.name.split('/').pop();
  const data: any = {};
  const fields = (doc.fields || {}) as Record<string, Record<string, unknown>>;
  for (const [key, value] of Object.entries(fields)) {
    data[key] = Object.values(value)[0];
  }

  return { id: workspaceId, data };
}
