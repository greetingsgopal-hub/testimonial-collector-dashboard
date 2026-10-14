import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./googleAuth', () => ({
  getServiceAccountAccessToken: vi.fn().mockResolvedValue('ya29.mock-sa-token'),
}));

import {
  verifyRazorpayWebhookSignature,
  createRazorpaySubscription,
  createRazorpayOrder,
  cancelRazorpaySubscription,
  isRazorpayEventProcessed,
  markRazorpayEventProcessed,
  updateWorkspaceFromRazorpay,
} from './razorpayClient';
import { WorkerEnv } from '../types';

describe('Razorpay Client & Webhook Signature Verification', () => {
  const mockEnv: WorkerEnv = {
    RAZORPAY_KEY_ID: 'rzp_test_mockKeyId123',
    RAZORPAY_KEY_SECRET: 'mockKeySecret456',
    RAZORPAY_WEBHOOK_SECRET: 'webhookSecret789',
    FIREBASE_PROJECT_ID: 'test-project',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifyRazorpayWebhookSignature', () => {
    it('verifies valid HMAC-SHA256 signature using Web Crypto API', async () => {
      const payload = JSON.stringify({ event: 'subscription.activated', id: 'evt_123' });
      const secret = 'webhookSecret789';

      // Compute expected HMAC-SHA256 signature using Web Crypto
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(payload));
      const expectedSignature = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = await verifyRazorpayWebhookSignature(payload, expectedSignature, secret);
      expect(isValid).toBe(true);
    });

    it('rejects tampered payload or incorrect signature', async () => {
      const payload = JSON.stringify({ event: 'subscription.activated' });
      const secret = 'webhookSecret789';

      const isValid = await verifyRazorpayWebhookSignature(payload, 'deadbeef12345678', secret);
      expect(isValid).toBe(false);
    });

    it('returns false when signature or secret is empty', async () => {
      expect(await verifyRazorpayWebhookSignature('{}', null, 'secret')).toBe(false);
      expect(await verifyRazorpayWebhookSignature('{}', 'sig', '')).toBe(false);
      expect(await verifyRazorpayWebhookSignature('', 'sig', 'secret')).toBe(false);
    });
  });

  describe('createRazorpaySubscription', () => {
    it('creates subscription via Razorpay REST API with basic auth', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'sub_test_123', status: 'created', plan_id: 'plan_monthly_456' }),
      });
      globalThis.fetch = mockFetch;

      const res = await createRazorpaySubscription(
        {
          planId: 'plan_monthly_456',
          totalCount: 120,
          notes: { workspaceId: 'ws_abc' },
        },
        mockEnv
      );

      expect(res.id).toBe('sub_test_123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.razorpay.com/v1/subscriptions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it('throws error when credentials are not configured', async () => {
      await expect(
        createRazorpaySubscription({ planId: 'plan_123' }, {} as any)
      ).rejects.toThrow('Razorpay credentials not configured');
    });
  });

  describe('createRazorpayOrder (Founding Lifetime)', () => {
    it('creates one-time order in paise via Razorpay REST API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'order_test_999', amount: 1199900, currency: 'INR' }),
      });
      globalThis.fetch = mockFetch;

      const res = await createRazorpayOrder(
        {
          amount: 1199900,
          currency: 'INR',
          receipt: 'founding_ws_1',
          notes: { workspaceId: 'ws_1', plan: 'founding' },
        },
        mockEnv
      );

      expect(res.id).toBe('order_test_999');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.razorpay.com/v1/orders',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"amount":1199900'),
        })
      );
    });
  });

  describe('cancelRazorpaySubscription', () => {
    it('cancels subscription at cycle end via REST API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'sub_123', status: 'cancelled' }),
      });
      globalThis.fetch = mockFetch;

      const res = await cancelRazorpaySubscription('sub_123', true, mockEnv);
      expect(res.status).toBe('cancelled');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.razorpay.com/v1/subscriptions/sub_123/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cancel_at_cycle_end: 1 }),
        })
      );
    });
  });

  describe('Idempotency & Workspace Updates', () => {
    it('checks idempotency ledger in firestoreAdmin', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ name: 'projects/test-project/databases/(default)/documents/razorpay_events/evt_1' }),
      });
      globalThis.fetch = mockFetch;

      const processed = await isRazorpayEventProcessed('evt_1', mockEnv);
      expect(processed).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/razorpay_events/evt_1'),
        expect.any(Object)
      );
    });

    it('marks event processed by writing to razorpay_events', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
      globalThis.fetch = mockFetch;

      await markRazorpayEventProcessed('evt_1', { type: 'subscription.activated' }, mockEnv);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/razorpay_events/evt_1'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
