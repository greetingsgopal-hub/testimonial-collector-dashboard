import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startRazorpayCheckout,
  loadRazorpayScript,
  fetchWorkspacePlan,
  initiateLiveRazorpayCheckout,
} from '../razorpay';

vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn().mockReturnValue({ id: 'mock-doc' }),
  getDoc: vi.fn(),
}));

import { auth } from '../firebase';
import { getDoc } from 'firebase/firestore';

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

  describe('createRazorpayOrder', () => {
    it('calls /api/razorpay/create-order and returns order data on success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          orderId: 'order_123',
          amount: 249900,
          currency: 'INR',
          keyId: 'rzp_test_key',
        }),
      });
      globalThis.fetch = mockFetch;

      const { createRazorpayOrder } = await import('../razorpay');
      const res = await createRazorpayOrder({ amount: 249900, currency: 'INR' });
      expect(res.success).toBe(true);
      expect(res.data?.orderId).toBe('order_123');
    });

    it('returns error when /api/razorpay/create-order fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Order creation failed' }),
      });
      globalThis.fetch = mockFetch;

      const { createRazorpayOrder } = await import('../razorpay');
      const res = await createRazorpayOrder();
      expect(res.success).toBe(false);
      expect(res.error).toBe('Order creation failed');
    });
  });

  describe('verifyRazorpayPayment', () => {
    it('calls /api/razorpay/verify-payment and returns verified status', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          verified: true,
          plan: 'Pro Plan',
          paymentMethod: { type: 'card', headline: '•••• 4242', subtext: 'Visa • CREDIT' },
          invoice: { id: 'INV-2026-4242', paymentId: 'pay_4242', date: 'Oct 15, 2026', amount: '₹2,499', status: 'Paid' },
        }),
      });
      globalThis.fetch = mockFetch;

      const { verifyRazorpayPayment } = await import('../razorpay');
      const res = await verifyRazorpayPayment({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_4242',
        razorpay_signature: 'sig_valid',
      });
      expect(res.success).toBe(true);
      expect(res.data?.verified).toBe(true);
      expect(res.data?.paymentMethod.headline).toBe('•••• 4242');
    });

    it('returns error when signature verification fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid payment signature' }),
      });
      globalThis.fetch = mockFetch;

      const { verifyRazorpayPayment } = await import('../razorpay');
      const res = await verifyRazorpayPayment({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_invalid',
        razorpay_signature: 'sig_bad',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid payment signature');
    });
  });

  describe('fetchWorkspacePlan', () => {
    it('returns workspace plan from firestore document when exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ plan: 'pro' }),
      } as any);

      const plan = await fetchWorkspacePlan('ws_123');
      expect(plan).toBe('pro');
    });

    it('returns starter when workspace document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const plan = await fetchWorkspacePlan('ws_missing');
      expect(plan).toBe('starter');
    });

    it('returns starter and catches error when getDoc throws', async () => {
      vi.mocked(getDoc).mockRejectedValueOnce(new Error('Network offline'));

      const plan = await fetchWorkspacePlan('ws_error');
      expect(plan).toBe('starter');
    });
  });

  describe('initiateLiveRazorpayCheckout', () => {
    it('creates order and triggers Razorpay modal with correct parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          orderId: 'order_live_999',
          amount: 249900,
          currency: 'INR',
          keyId: 'rzp_live_TodkFfMsbdY3vr',
        }),
      });
      globalThis.fetch = mockFetch;

      const mockOpen = vi.fn();
      // @ts-ignore
      window.Razorpay = vi.fn(function () {
        return { open: mockOpen };
      });

      await initiateLiveRazorpayCheckout({
        planId: 'pro',
        planName: 'Pro',
        amountInRupees: 2499,
        workspaceId: 'ws_test',
        userEmail: 'user@example.com',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('createRazorpayOrder'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount: 249900,
            currency: 'INR',
            planId: 'pro',
            userId: 'ws_test',
          }),
        })
      );
      expect(mockOpen).toHaveBeenCalled();
    });
  });
});


