import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startRazorpayCheckout, loadRazorpayScript } from '../razorpay';

vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

import { auth } from '../firebase';

describe('Frontend Razorpay Checkout Client (src/lib/razorpay.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (auth as any).currentUser = null;
  });

  it('redirects unauthenticated users to signup page with plan query param', async () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { href: '' } as any;

    const res = await startRazorpayCheckout('pro');
    expect(res.success).toBe(false);
    expect(res.error).toContain('User is not authenticated');
    expect(window.location.href).toContain('/signup?plan=pro');

    window.location = originalLocation;
  });

  it('calls /api/razorpay/checkout with Bearer token for authenticated users', async () => {
    (auth as any).currentUser = {
      getIdToken: vi.fn().mockResolvedValue('mock-firebase-token-123'),
      email: 'founder@test.com',
      displayName: 'Alex Founder',
    };

    const mockRazorpayInstance = {
      open: vi.fn(),
      on: vi.fn(),
    };
    // @ts-ignore
    window.Razorpay = vi.fn(function () {
      return mockRazorpayInstance;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'subscription',
        keyId: 'rzp_test_123',
        subscriptionId: 'sub_test_abc',
        name: 'PandaPraise',
        description: 'PandaPraise Pro Subscription (monthly)',
      }),
    });
    globalThis.fetch = mockFetch;

    const res = await startRazorpayCheckout('monthly');
    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/razorpay/checkout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-firebase-token-123',
        }),
        body: JSON.stringify({ plan: 'monthly' }),
      })
    );
    expect(window.Razorpay).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'rzp_test_123',
        subscription_id: 'sub_test_abc',
      })
    );
    expect(mockRazorpayInstance.open).toHaveBeenCalled();
  });

  it('handles founding lifetime order payload correctly', async () => {
    (auth as any).currentUser = {
      getIdToken: vi.fn().mockResolvedValue('mock-firebase-token-123'),
      email: 'founder@test.com',
      displayName: 'Alex Founder',
    };

    const mockRazorpayInstance = {
      open: vi.fn(),
      on: vi.fn(),
    };
    // @ts-ignore
    window.Razorpay = vi.fn(function () {
      return mockRazorpayInstance;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'order',
        keyId: 'rzp_test_123',
        orderId: 'order_test_999',
        amount: 1199900,
        currency: 'INR',
        name: 'PandaPraise',
        description: 'Founding Member Lifetime Pro Plan',
      }),
    });
    globalThis.fetch = mockFetch;

    const res = await startRazorpayCheckout('founding');
    expect(res.success).toBe(true);
    expect(window.Razorpay).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'rzp_test_123',
        order_id: 'order_test_999',
        amount: 1199900,
        currency: 'INR',
      })
    );
    expect(mockRazorpayInstance.open).toHaveBeenCalled();
  });

  it('returns clean error message when /api/razorpay/checkout fails', async () => {
    (auth as any).currentUser = {
      getIdToken: vi.fn().mockResolvedValue('mock-firebase-token-123'),
      email: 'founder@test.com',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Razorpay credentials not configured' }),
    });
    globalThis.fetch = mockFetch;

    const res = await startRazorpayCheckout('monthly');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Razorpay credentials not configured');
  });
});
