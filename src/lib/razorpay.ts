import { auth } from './firebase';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically loads the Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js).
 */
export async function loadRazorpayScript(timeoutMs = 5000): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: boolean) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        clearInterval(poll);
        resolve(val);
      }
    };

    const timer = setTimeout(() => {
      finish(Boolean(window.Razorpay));
    }, timeoutMs);

    // Poll in case window.Razorpay is injected or script already in DOM
    const poll = setInterval(() => {
      if (window.Razorpay) {
        finish(true);
      }
    }, 100);

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      if (window.Razorpay) {
        finish(true);
        return;
      }
      existingScript.addEventListener('load', () => finish(Boolean(window.Razorpay)), { once: true });
      existingScript.addEventListener('error', () => finish(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => finish(Boolean(window.Razorpay));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Checkout (Subscription or One-time Order).
 *
 * @param plan - 'monthly' | 'annual' | 'founding' | 'pro' | 'starter'
 * @param onSuccess - optional callback invoked when payment/subscription succeeds
 */
export async function startRazorpayCheckout(
  plan: string,
  onSuccess?: (response: any) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        window.location.href = `/signup?plan=${encodeURIComponent(plan)}`;
      }
      return { success: false, error: 'User is not authenticated' };
    }

    const token = await currentUser.getIdToken();
    const res = await fetch('/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = data.error || 'Failed to initiate Razorpay checkout session.';
      return { success: false, error: errMsg };
    }

    // Load checkout.js if not already present
    const loaded = await loadRazorpayScript();
    if (!loaded && typeof window !== 'undefined' && !window.Razorpay) {
      return { success: false, error: 'Failed to load Razorpay payment gateway. Please check your internet connection.' };
    }

    if (typeof window !== 'undefined' && window.Razorpay) {
      const options: any = {
        key: data.keyId,
        name: data.name || 'PandaPraise',
        description: data.description || 'PandaPraise Pro Plan',
        image: 'https://pandapraise.com/favicon.ico',
        theme: {
          color: '#6701e6',
        },
        prefill: {
          email: currentUser.email || '',
          name: currentUser.displayName || '',
          ...data.prefill,
        },
        handler: function (response: any) {
          if (onSuccess) {
            onSuccess(response);
          } else {
            // Optimistic navigation / reload
            window.location.href = '/dashboard?checkout=success';
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay] Checkout modal dismissed');
          },
        },
      };

      if (data.type === 'subscription' && data.subscriptionId) {
        options.subscription_id = data.subscriptionId;
      } else if (data.orderId) {
        options.order_id = data.orderId;
        options.amount = data.amount;
        options.currency = data.currency || 'INR';
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      return { success: true };
    }

    return { success: false, error: 'Razorpay SDK could not be initialized' };
  } catch (err: any) {
    console.error('[Razorpay] Checkout error:', err);
    return { success: false, error: err.message || 'Error launching checkout' };
  }
}

/**
 * Create a Razorpay Order directly via Cloudflare Worker backend.
 * POST /api/razorpay/create-order
 */
export async function createRazorpayOrder(params?: {
  amount?: number;
  currency?: string;
  workspace?: string;
  taxId?: string;
}): Promise<{
  success: boolean;
  data?: { orderId: string; amount: number; currency: string; keyId: string };
  error?: string;
}> {
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to create Razorpay order' };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating order' };
  }
}

/**
 * Verify Razorpay payment signature and obtain formatted invoice and payment instrument details.
 * POST /api/razorpay/verify-payment
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{
  success: boolean;
  data?: {
    verified: boolean;
    plan: string;
    paymentMethod: { type: string; headline: string; subtext: string };
    invoice: { id: string; paymentId: string; date: string; amount: string; status: string };
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Payment signature verification failed' };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error verifying payment' };
  }
}

