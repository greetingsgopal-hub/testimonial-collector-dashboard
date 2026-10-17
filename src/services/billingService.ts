import { loadRazorpayScript } from '../lib/razorpay';

export interface SecureRazorpayCheckoutParams {
  workspaceId: string;
  workspaceName: string;
  billingEmail: string;
  taxId: string;
  planId: 'pro' | 'agency' | 'lifetime';
  planLabel: string;
  amountMajor: number;
  currency: 'INR' | 'USD';
  onSuccess: (paymentId: string) => void;
  onCancelOrError: (errMessage?: string) => void;
}

/**
 * 1. Secure Razorpay Checkout
 * - No client-side Firestore plan updates.
 * - Delegates all order creation and HMAC verification to the backend.
 * - Exiting modal never creates fake invoices or modifies plan status.
 */
export async function runSecureRazorpayCheckout(params: SecureRazorpayCheckoutParams) {
  const {
    workspaceId,
    workspaceName,
    billingEmail,
    taxId,
    planId,
    planLabel,
    amountMajor,
    currency,
    onSuccess,
    onCancelOrError,
  } = params;

  // 1. Ensure Razorpay SDK is loaded
  const loaded = await loadRazorpayScript(4000);
  if (!loaded || !(window as any).Razorpay) {
    onCancelOrError('Could not load Razorpay Checkout SDK. Check your network or ad-blocker.');
    return;
  }

  const amountSubunits = amountMajor * 100;
  const rawApiBase =
    (import.meta as any).env?.VITE_FIREBASE_API_BASE ||
    (import.meta as any).env?.VITE_API_BASE_URL ||
    '';
  const apiBase = rawApiBase ? rawApiBase.replace(/\/$/, '') : '';
  const keyId =
    (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TodkFfMsbdY3vr';

  let orderId = '';
  try {
    const orderEndpoint = apiBase ? `${apiBase}/createRazorpayOrder` : '/createRazorpayOrder';
    const orderRes = await fetch(orderEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountSubunits,
        currency,
        planId,
        userId: workspaceId,
      }),
    });

    if (orderRes.ok) {
      const orderJson = await orderRes.json();
      orderId = orderJson.orderId || '';
    }
  } catch (err) {
    console.warn('Backend order creation warning:', err);
  }

  const rzp = new (window as any).Razorpay({
    key: keyId,
    amount: amountSubunits,
    currency,
    name: 'PandaPraise',
    description: `${planLabel} (${workspaceName})`,
    ...(orderId ? { order_id: orderId } : {}),
    prefill: {
      email: billingEmail,
    },
    notes: {
      workspace_id: workspaceId,
      gstin: taxId,
      plan_id: planId,
    },
    theme: { color: '#7C3AED' },
    modal: {
      // SECURE: Dismissing modal does NOT grant plan or create fake invoice
      ondismiss: () => {
        onCancelOrError('Checkout cancelled.');
      },
    },
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }) => {
      if (!response?.razorpay_payment_id) {
        onCancelOrError('No payment ID returned from gateway.');
        return;
      }

      // Delegate verification entirely to backend worker
      try {
        const verifyEndpoint = apiBase ? `${apiBase}/verifyRazorpayPayment` : '/verifyRazorpayPayment';
        const verifyRes = await fetch(verifyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            planId,
            userId: workspaceId,
          }),
        });

        if (!verifyRes.ok) {
          const errData = await verifyRes.json().catch(() => ({}));
          onCancelOrError(errData.error || 'Payment signature verification failed on backend server.');
          return;
        }

        onSuccess(response.razorpay_payment_id);
      } catch (err: any) {
        onCancelOrError(err.message || 'Payment verification encountered a network error.');
      }
    },
  });

  rzp.on('payment.failed', (errResp: any) => {
    onCancelOrError(errResp?.error?.description || 'Payment was declined or failed on gateway.');
  });

  rzp.open();
}

/**
 * 2. Clean Metric Calculations (Evaluate Tab)
 * - Returns 0.0 instead of a fake 5.0 when empty or awaiting approvals
 */
export function calculateEvaluationMetrics(testimonials: any[]) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return {
      totalCount: 0,
      approvedCount: 0,
      avgRating: 0.0,
    };
  }

  const approved = testimonials.filter((t) => t.status === 'approved');
  const avgRating =
    approved.length > 0
      ? Number((approved.reduce((sum, r) => sum + Number(r.rating || 5), 0) / approved.length).toFixed(1))
      : 0.0;

  return {
    totalCount: testimonials.length,
    approvedCount: approved.length,
    avgRating,
  };
}
