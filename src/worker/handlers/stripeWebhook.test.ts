import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * C5 regression tests: Stripe webhook handler.
 * Verifies signature validation, idempotency, and subscription state changes.
 */

vi.mock('../lib/stripeClient', () => ({
  verifyWebhookSignature: vi.fn(),
  isEventProcessed: vi.fn().mockResolvedValue(false),
  markEventProcessed: vi.fn().mockResolvedValue(undefined),
  updateWorkspaceSubscription: vi.fn().mockResolvedValue(undefined),
  getWorkspaceByCustomerId: vi.fn().mockResolvedValue(null),
  getPricePlanTier: vi.fn().mockImplementation((priceId: string) => {
    if (priceId === 'price_starter') return 'starter';
    if (priceId === 'price_pro') return 'pro';
    return null;
  }),
}));

import { handleStripeWebhook } from './stripeWebhook';
import {
  verifyWebhookSignature,
  isEventProcessed,
  markEventProcessed,
  updateWorkspaceSubscription,
  getWorkspaceByCustomerId,
} from '../lib/stripeClient';

const mockedVerify = vi.mocked(verifyWebhookSignature);
const mockedIsProcessed = vi.mocked(isEventProcessed);
const mockedMarkProcessed = vi.mocked(markEventProcessed);
const mockedUpdateWorkspace = vi.mocked(updateWorkspaceSubscription);
const mockedGetWorkspace = vi.mocked(getWorkspaceByCustomerId);

const baseEnv = {
  STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
};

function makeEvent(type: string, data: any, id = 'evt_123') {
  return { id, type, data: { object: data } };
}

function makeRequest(body: string, headers: Record<string, string> = {}) {
  return new Request('https://worker.test/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

function signedRequest(event: any): Request {
  return makeRequest(JSON.stringify(event), { 'Stripe-Signature': 't=1,v1=good' });
}

describe('Stripe webhook handler (C5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsProcessed.mockResolvedValue(false);
    mockedMarkProcessed.mockResolvedValue(undefined);
    mockedUpdateWorkspace.mockResolvedValue(undefined);
    mockedGetWorkspace.mockResolvedValue(null);
  });

  describe('signature validation', () => {
    it('returns 400 when signature verification fails', async () => {
      mockedVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await handleStripeWebhook(
        makeRequest('{}', { 'Stripe-Signature': 't=1,v1=bad' }),
        baseEnv as any
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Invalid signature');
      expect(mockedUpdateWorkspace).not.toHaveBeenCalled();
    });

    it('returns 400 when Stripe-Signature header is missing', async () => {
      mockedVerify.mockImplementation(() => {
        throw new Error('Missing Stripe-Signature header.');
      });

      const res = await handleStripeWebhook(makeRequest('{}'), baseEnv as any);

      expect(res.status).toBe(400);
      expect(mockedUpdateWorkspace).not.toHaveBeenCalled();
    });

    it('verifies signature using the raw request body', async () => {
      const rawBody = JSON.stringify(makeEvent('checkout.session.completed', {}));
      mockedVerify.mockReturnValue(makeEvent('checkout.session.completed', {}) as any);

      await handleStripeWebhook(
        makeRequest(rawBody, { 'Stripe-Signature': 't=1,v1=good' }),
        baseEnv as any
      );

      expect(mockedVerify).toHaveBeenCalledWith(rawBody, 't=1,v1=good', baseEnv);
    });
  });

  describe('idempotency', () => {
    it('skips already-processed events without re-applying updates', async () => {
      mockedVerify.mockReturnValue(makeEvent('checkout.session.completed', {}) as any);
      mockedIsProcessed.mockResolvedValue(true);

      const res = await handleStripeWebhook(
        makeRequest('{}', { 'Stripe-Signature': 't=1,v1=good' }),
        baseEnv as any
      );

      expect(res.status).toBe(200);
      expect(mockedUpdateWorkspace).not.toHaveBeenCalled();
      expect(mockedMarkProcessed).not.toHaveBeenCalled();
    });

    it('marks new events as processed after successful handling', async () => {
      const event = makeEvent('checkout.session.completed', {
        metadata: { workspaceId: 'ws_1' },
        customer: 'cus_1',
        subscription: 'sub_1',
        payment_status: 'paid',
      });
      mockedVerify.mockReturnValue(event as any);

      const res = await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(res.status).toBe(200);
      expect(mockedMarkProcessed).toHaveBeenCalledWith('evt_123', baseEnv);
    });

    it('does not mark event processed when processing fails (allows retry)', async () => {
      const event = makeEvent('checkout.session.completed', {
        metadata: { workspaceId: 'ws_1' },
      });
      mockedVerify.mockReturnValue(event as any);
      mockedUpdateWorkspace.mockRejectedValue(new Error('Firestore write failed'));

      const res = await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(res.status).toBe(500);
      expect(mockedMarkProcessed).not.toHaveBeenCalled();
    });
  });

  describe('subscription state changes', () => {
    it('checkout.session.completed updates workspace with active subscription and plan', async () => {
      const event = makeEvent('checkout.session.completed', {
        metadata: { workspaceId: 'ws_1' },
        customer: 'cus_1',
        subscription: 'sub_1',
        payment_status: 'paid',
        line_items: { data: [{ price: { id: 'price_starter' } }] },
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).toHaveBeenCalledWith(
        'ws_1',
        expect.objectContaining({
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          subscriptionStatus: 'active',
          plan: 'starter',
        }),
        baseEnv
      );
    });

    it('customer.subscription.updated syncs status and plan', async () => {
      mockedGetWorkspace.mockResolvedValue({ id: 'ws_1', data: {} });
      const event = makeEvent('customer.subscription.updated', {
        customer: 'cus_1',
        id: 'sub_1',
        status: 'past_due',
        items: { data: [{ price: { id: 'price_pro' } }] },
        current_period_end: 1800000000,
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).toHaveBeenCalledWith(
        'ws_1',
        expect.objectContaining({
          subscriptionStatus: 'past_due',
          plan: 'pro',
        }),
        baseEnv
      );
    });

    it('customer.subscription.deleted downgrades to free', async () => {
      mockedGetWorkspace.mockResolvedValue({ id: 'ws_1', data: {} });
      const event = makeEvent('customer.subscription.deleted', {
        customer: 'cus_1',
        id: 'sub_1',
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).toHaveBeenCalledWith(
        'ws_1',
        expect.objectContaining({
          subscriptionStatus: 'cancelled',
          plan: 'free',
        }),
        baseEnv
      );
    });

    it('invoice.payment_failed marks workspace past_due', async () => {
      mockedGetWorkspace.mockResolvedValue({ id: 'ws_1', data: {} });
      const event = makeEvent('invoice.payment_failed', {
        customer: 'cus_1',
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).toHaveBeenCalledWith(
        'ws_1',
        expect.objectContaining({ subscriptionStatus: 'past_due' }),
        baseEnv
      );
    });

    it('invoice.payment_succeeded restores active only when past_due', async () => {
      mockedGetWorkspace.mockResolvedValue({ id: 'ws_1', data: { subscriptionStatus: 'past_due' } });
      const event = makeEvent('invoice.payment_succeeded', {
        customer: 'cus_1',
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).toHaveBeenCalledWith(
        'ws_1',
        expect.objectContaining({ subscriptionStatus: 'active' }),
        baseEnv
      );
    });

    it('invoice.payment_succeeded does not overwrite active status', async () => {
      mockedGetWorkspace.mockResolvedValue({ id: 'ws_1', data: { subscriptionStatus: 'active' } });
      const event = makeEvent('invoice.payment_succeeded', {
        customer: 'cus_1',
      });
      mockedVerify.mockReturnValue(event as any);

      await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(mockedUpdateWorkspace).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('does not expose internal error details to the caller', async () => {
      const event = makeEvent('checkout.session.completed', {
        metadata: { workspaceId: 'ws_1' },
      });
      mockedVerify.mockReturnValue(event as any);
      mockedUpdateWorkspace.mockRejectedValue(new Error('Internal: secret-key=sk_live_xyz'));

      const res = await handleStripeWebhook(signedRequest(event), baseEnv as any);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Processing failed');
      expect(JSON.stringify(body)).not.toContain('sk_live_xyz');
    });
  });
});
