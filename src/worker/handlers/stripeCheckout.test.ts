import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * C5 regression tests: Stripe checkout/subscription endpoints.
 * Verifies authentication, price validation, and unauthorized access prevention.
 */

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((h: string) => h.replace(/^Bearer\s+/i, '')),
  verifyFirebaseToken: vi.fn(),
}));

vi.mock('../lib/firestoreAdmin', () => ({
  getDocument: vi.fn(),
  queryUserDocuments: vi.fn(),
}));

vi.mock('../lib/stripeClient', () => ({
  getOrCreateStripeCustomer: vi.fn(),
  createCheckoutSession: vi.fn(),
  createBillingPortalSession: vi.fn(),
}));

import { handleCreateCheckoutSession, handleBillingPortal, handleGetSubscription } from './stripeCheckout';
import { verifyFirebaseToken } from '../lib/firebaseAuth';
import { queryUserDocuments } from '../lib/firestoreAdmin';
import { getOrCreateStripeCustomer, createCheckoutSession, createBillingPortalSession } from '../lib/stripeClient';

const mockedVerifyToken = vi.mocked(verifyFirebaseToken);
const mockedQueryUserDocuments = vi.mocked(queryUserDocuments);
const mockedGetOrCreateCustomer = vi.mocked(getOrCreateStripeCustomer);
const mockedCreateCheckout = vi.mocked(createCheckoutSession);
const mockedCreatePortal = vi.mocked(createBillingPortalSession);

const baseEnv = {
  STRIPE_PRICE_SUBSCRIPTION_MONTHLY: 'price_subscription_m',
  STRIPE_PRICE_SUBSCRIPTION_ANNUAL: 'price_subscription_a',
  STRIPE_PRICE_FOUNDING_LIFETIME: 'price_founding_lifetime',
};

function makeRequest(method: string, body?: any, headers: Record<string, string> = {}) {
  return new Request('https://worker.test/api/stripe/checkout', {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const authedUser = { uid: 'user_1', email: 'test@example.com' };

describe('Stripe checkout endpoint (C5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const res = await handleCreateCheckoutSession(makeRequest('POST', { priceId: 'price_starter_m' }), baseEnv as any);
      expect(res.status).toBe(401);
      expect(mockedCreateCheckout).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', async () => {
      mockedVerifyToken.mockResolvedValue(null);
      const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_starter_m' }, { Authorization: 'Bearer invalid' }),
        baseEnv as any
      );
      expect(res.status).toBe(401);
      expect(mockedCreateCheckout).not.toHaveBeenCalled();
    });

    it('returns 401 for billing portal when unauthenticated', async () => {
      const res = await handleBillingPortal(makeRequest('POST', {}), baseEnv as any);
      expect(res.status).toBe(401);
    });

    it('returns 401 for subscription status when unauthenticated', async () => {
      const res = await handleGetSubscription(makeRequest('GET', undefined), baseEnv as any);
      expect(res.status).toBe(401);
    });
  });

  describe('price validation', () => {
    it('returns 400 for invalid priceId', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_evil' }, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );
      expect(res.status).toBe(400);
      expect(mockedCreateCheckout).not.toHaveBeenCalled();
    });

    it('returns 400 when priceId is missing', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      const res = await handleCreateCheckoutSession(
        makeRequest('POST', {}, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );
      expect(res.status).toBe(400);
    });

    it('accepts the founding lifetime price ID', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{ id: 'ws_1', plan: 'free' }] as any);
      mockedGetOrCreateCustomer.mockResolvedValue('cus_new');
      mockedCreateCheckout.mockResolvedValue('https://checkout.stripe.com/test');

      const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_founding_lifetime' }, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(200);
      expect(mockedCreateCheckout).toHaveBeenCalledWith('ws_1', 'cus_new', 'price_founding_lifetime', 'https://worker.test', baseEnv);
    });
  });

  describe('checkout session creation', () => {
    it('creates customer and checkout session for authenticated user', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{ id: 'ws_1', plan: 'free' }] as any);
      mockedGetOrCreateCustomer.mockResolvedValue('cus_new');
      mockedCreateCheckout.mockResolvedValue('https://checkout.stripe.com/test');

    const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_subscription_m' }, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe('https://checkout.stripe.com/test');
      expect(mockedGetOrCreateCustomer).toHaveBeenCalledWith('ws_1', { id: 'ws_1', plan: 'free' }, 'test@example.com', baseEnv);
      expect(mockedCreateCheckout).toHaveBeenCalledWith('ws_1', 'cus_new', 'price_subscription_m', 'https://worker.test', baseEnv);
    });

    it('returns 404 when workspace not found', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([] as any);

      const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_subscription_m' }, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(404);
      expect(mockedCreateCheckout).not.toHaveBeenCalled();
    });

    it('returns 500 without exposing Stripe error details when session creation fails', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{ id: 'ws_1', plan: 'free' }] as any);
      mockedGetOrCreateCustomer.mockResolvedValue('cus_new');
      mockedCreateCheckout.mockRejectedValue(new Error('Stripe error: sk_live_secret_key'));

      const res = await handleCreateCheckoutSession(
        makeRequest('POST', { priceId: 'price_subscription_m' }, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain('sk_live_secret_key');
    });
  });

  describe('unauthorized access prevention', () => {
    it('billing portal only works for workspace with stripeCustomerId', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{ id: 'ws_1', plan: 'free' }] as any); // no stripeCustomerId

      const res = await handleBillingPortal(
        makeRequest('POST', {}, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(400);
      expect(mockedCreatePortal).not.toHaveBeenCalled();
    });

    it('billing portal creates portal session for subscribed workspace', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{ id: 'ws_1', plan: 'starter', stripeCustomerId: 'cus_1' }] as any);
      mockedCreatePortal.mockResolvedValue('https://billing.stripe.com/test');

      const res = await handleBillingPortal(
        makeRequest('POST', {}, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe('https://billing.stripe.com/test');
      expect(mockedCreatePortal).toHaveBeenCalledWith('cus_1', 'https://worker.test', baseEnv);
    });

    it('subscription status returns workspace subscription data only for own workspace', async () => {
      mockedVerifyToken.mockResolvedValue(authedUser as any);
      mockedQueryUserDocuments.mockResolvedValue([{
        id: 'ws_1',
        plan: 'pro',
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
      }] as any);

      const res = await handleGetSubscription(
        makeRequest('GET', undefined, { Authorization: 'Bearer valid' }),
        baseEnv as any
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.plan).toBe('pro');
      expect(data.subscriptionStatus).toBe('active');
      // Workspace is resolved by ownerId — cannot access another user's workspace
      expect(mockedQueryUserDocuments).toHaveBeenCalledWith('workspaces', 'user_1', undefined, baseEnv);
    });
  });
});
