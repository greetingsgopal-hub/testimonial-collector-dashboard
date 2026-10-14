import { auth } from './firebase';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically loads the Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js).
 */
export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
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
