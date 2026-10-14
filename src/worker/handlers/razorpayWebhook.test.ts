import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRazorpayWebhook } from './razorpayWebhook';
import { WorkerEnv } from '../types';

vi.mock('../lib/razorpayClient', () => ({
  verifyRazorpayWebhookSignature: vi.fn(),
  isRazorpayEventProcessed: vi.fn(),
  markRazorpayEventProcessed: vi.fn(),
  updateWorkspaceFromRazorpay: vi.fn(),
  getWorkspaceByRazorpaySubscriptionId: vi.fn(),
}));

import {
  verifyRazorpayWebhookSignature,
  isRazorpayEventProcessed,
  markRazorpayEventProcessed,
  updateWorkspaceFromRazorpay,
  getWorkspaceByRazorpaySubscriptionId,
} from '../lib/razorpayClient';

describe('POST /api/webhook/razorpay', () => {
  const mockEnv: WorkerEnv = {
    RAZORPAY_KEY_ID: 'rzp_test_key',
    RAZORPAY_KEY_SECRET: 'rzp_test_secret',
    RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret',
    FIREBASE_PROJECT_ID: 'test-project',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function makeRequest(eventData: any, signature: string | null = 'valid_sig') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (signature) {
      headers['X-Razorpay-Signature'] = signature;
    }
    return new Request('https://pandapraise.com/api/webhook/razorpay', {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
    });
  }

  describe('signature validation', () => {
    it('returns 400 when X-Razorpay-Signature is missing', async () => {
      const req = makeRequest({ event: 'subscription.activated' }, null);
      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Missing X-Razorpay-Signature');
    });

    it('returns 400 when signature verification fails', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(false);

      const req = makeRequest({ event: 'subscription.activated' }, 'bad_sig');
      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid webhook signature');
    });
  });

  describe('idempotency', () => {
    it('skips already processed events', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(true);
      vi.mocked(isRazorpayEventProcessed).mockResolvedValue(true);

      const req = makeRequest({
        event: 'subscription.activated',
        id: 'evt_processed_123',
      });
      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.received).toBe(true);
      expect(updateWorkspaceFromRazorpay).not.toHaveBeenCalled();
    });
  });

  describe('subscription events', () => {
    it('handles subscription.activated and updates workspace to pro/active', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(true);
      vi.mocked(isRazorpayEventProcessed).mockResolvedValue(false);

      const req = makeRequest({
        id: 'evt_act_1',
        event: 'subscription.activated',
        payload: {
          subscription: {
            entity: {
              id: 'sub_test_1',
              customer_id: 'cust_test_1',
              current_end: 1735689600,
              notes: { workspaceId: 'ws_test_1', plan: 'monthly' },
            },
          },
        },
      });

      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(200);
      expect(updateWorkspaceFromRazorpay).toHaveBeenCalledWith(
        'ws_test_1',
        expect.objectContaining({
          plan: 'pro',
          subscriptionStatus: 'active',
          razorpaySubscriptionId: 'sub_test_1',
          razorpayCustomerId: 'cust_test_1',
        }),
        mockEnv
      );
      expect(markRazorpayEventProcessed).toHaveBeenCalledWith('evt_act_1', expect.any(Object), mockEnv);
    });

    it('handles subscription.halted and marks workspace halted', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(true);
      vi.mocked(isRazorpayEventProcessed).mockResolvedValue(false);

      const req = makeRequest({
        id: 'evt_halt_1',
        event: 'subscription.halted',
        payload: {
          subscription: {
            entity: {
              id: 'sub_test_2',
              notes: { workspaceId: 'ws_test_2' },
            },
          },
        },
      });

      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(200);
      expect(updateWorkspaceFromRazorpay).toHaveBeenCalledWith(
        'ws_test_2',
        expect.objectContaining({
          subscriptionStatus: 'halted',
        }),
        mockEnv
      );
    });

    it('handles subscription.cancelled and downgrades workspace to free', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(true);
      vi.mocked(isRazorpayEventProcessed).mockResolvedValue(false);

      const req = makeRequest({
        id: 'evt_canc_1',
        event: 'subscription.cancelled',
        payload: {
          subscription: {
            entity: {
              id: 'sub_test_3',
              notes: { workspaceId: 'ws_test_3' },
            },
          },
        },
      });

      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(200);
      expect(updateWorkspaceFromRazorpay).toHaveBeenCalledWith(
        'ws_test_3',
        expect.objectContaining({
          plan: 'free',
          subscriptionStatus: 'cancelled',
        }),
        mockEnv
      );
    });
  });

  describe('founding lifetime payment event', () => {
    it('handles payment.captured for founding lifetime and activates permanent pro plan', async () => {
      vi.mocked(verifyRazorpayWebhookSignature).mockResolvedValue(true);
      vi.mocked(isRazorpayEventProcessed).mockResolvedValue(false);

      const req = makeRequest({
        id: 'evt_pay_1',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_999',
              order_id: 'order_test_888',
              amount: 1199900,
              notes: { workspaceId: 'ws_founding_1', plan: 'founding' },
            },
          },
        },
      });

      const res = await handleRazorpayWebhook(req, mockEnv);
      expect(res.status).toBe(200);
      expect(updateWorkspaceFromRazorpay).toHaveBeenCalledWith(
        'ws_founding_1',
        expect.objectContaining({
          plan: 'pro',
          subscriptionStatus: 'active',
          billingCycle: 'lifetime',
          razorpayPaymentId: 'pay_test_999',
          razorpayOrderId: 'order_test_888',
        }),
        mockEnv
      );
    });
  });
});
