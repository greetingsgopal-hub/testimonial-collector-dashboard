import { WorkerEnv } from '../types';

export interface RazorpayEnv {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  [key: string]: any;
}

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Helper: Verify Razorpay HMAC-SHA256 Signature using Web Crypto API.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const data = encoder.encode(`${orderId}|${paymentId}`);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return generatedSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error('[RazorpayOrder] Signature verification exception:', err);
    return false;
  }
}

/**
 * Helper to build Razorpay Basic Auth Header.
 */
function getAuthHeader(env: RazorpayEnv): string {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)');
  }
  return 'Basic ' + btoa(`${keyId}:${keySecret}`);
}

/**
 * 1. POST /api/razorpay/create-order
 * Creates a Razorpay order via Basic Auth and returns orderId, amount, currency, and keyId.
 */
export async function handleRazorpayCreateOrder(
  request: Request,
  env: RazorpayEnv | WorkerEnv
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = getAuthHeader(env);
    const body: any = await request.json().catch(() => ({}));
    const amountInPaise = body.amount || 249900; // ₹2,499.00 (or 2900 for $29)
    const currency = body.currency || 'INR';

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          workspace: body.workspace || 'PandaPraise',
          gstin: body.taxId || '',
        },
      }),
    });

    const order: any = await rzpRes.json();
    if (!rzpRes.ok) {
      return new Response(
        JSON.stringify({ error: order.error?.description || 'Order creation failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * 2. POST /api/razorpay/verify-payment
 * Verifies HMAC-SHA256 signature, fetches payment instrument details from Razorpay API,
 * and formats payment method display and tax invoice data.
 */
export async function handleRazorpayVerifyPayment(
  request: Request,
  env: RazorpayEnv | WorkerEnv
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = getAuthHeader(env);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }: any = await request.json().catch(() => ({}));

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (order_id, payment_id, signature)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      env.RAZORPAY_KEY_SECRET || ''
    );

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch actual payment instrument details (Card last4 / network or UPI VPA) from Razorpay
    const paymentRes = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      { headers: { Authorization: authHeader } }
    );
    const paymentData: any = await paymentRes.json();

    let paymentMethodDisplay = {
      type: paymentData.method || 'card',
      headline: 'Active Mandate',
      subtext: 'Verified via Razorpay',
    };

    if (paymentData.method === 'card' && paymentData.card) {
      paymentMethodDisplay = {
        type: 'card',
        headline: `•••• ${paymentData.card.last4}`,
        subtext: `${paymentData.card.network} • ${paymentData.card.type?.toUpperCase() || 'CARD'}`,
      };
    } else if (paymentData.method === 'upi') {
      paymentMethodDisplay = {
        type: 'upi',
        headline: paymentData.vpa || 'UPI Autopay',
        subtext: 'Verified UPI Mandate',
      };
    }

    const newInvoice = {
      id: `INV-${new Date().getFullYear()}-${razorpay_payment_id.slice(-5).toUpperCase()}`,
      paymentId: razorpay_payment_id,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      amount:
        paymentData.currency === 'INR'
          ? `₹${(paymentData.amount / 100).toLocaleString('en-IN')}`
          : `$${(paymentData.amount / 100).toFixed(2)}`,
      status: 'Paid',
    };

    // Ready for persistence to storage if workspace context provided
    return new Response(
      JSON.stringify({
        verified: true,
        plan: 'Pro Plan',
        paymentMethod: paymentMethodDisplay,
        invoice: newInvoice,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Universal router for Razorpay Order flow:
 * Handles OPTIONS, /create-order, and /verify-payment
 */
export async function handleRazorpayOrderRoute(
  request: Request,
  env: RazorpayEnv | WorkerEnv
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  if (url.pathname.endsWith('/create-order') && request.method === 'POST') {
    return handleRazorpayCreateOrder(request, env);
  }

  if (url.pathname.endsWith('/verify-payment') && request.method === 'POST') {
    return handleRazorpayVerifyPayment(request, env);
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

export default {
  async fetch(request: Request, env: RazorpayEnv | WorkerEnv): Promise<Response> {
    return handleRazorpayOrderRoute(request, env);
  },
};
