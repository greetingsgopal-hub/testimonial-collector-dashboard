import { auth } from './firebase';

/**
 * Initiates Stripe Checkout session by calling the Cloudflare Worker endpoint.
 *
 * @param priceId - Stripe price ID or plan key ('monthly' | 'annual' | 'founding')
 */
export async function startStripeCheckout(
  priceId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      // Redirect to signup with plan parameter if not logged in
      if (typeof window !== 'undefined') {
        window.location.href = `/signup?plan=${encodeURIComponent(priceId)}`;
      }
      return { success: false, error: 'User is not authenticated' };
    }

    const token = await currentUser.getIdToken();
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      const errMsg = data.error || 'Failed to start Stripe Checkout session.';
      return { success: false, error: errMsg };
    }

    if (typeof window !== 'undefined') {
      window.location.href = data.url;
    }
    return { success: true, url: data.url };
  } catch (err: any) {
    console.error('[Stripe] Checkout initiation failed:', err);
    return { success: false, error: err.message || 'Network error initiating checkout' };
  }
}

/**
 * Opens the Stripe Customer Billing Portal for subscription and invoice management.
 */
export async function openBillingPortal(): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User is not authenticated' };
    }

    const token = await currentUser.getIdToken();
    const res = await fetch('/api/stripe/billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      const errMsg = data.error || 'Failed to open customer billing portal.';
      return { success: false, error: errMsg };
    }

    if (typeof window !== 'undefined') {
      window.location.href = data.url;
    }
    return { success: true, url: data.url };
  } catch (err: any) {
    console.error('[Stripe] Billing portal open failed:', err);
    return { success: false, error: err.message || 'Network error opening billing portal' };
  }
}
