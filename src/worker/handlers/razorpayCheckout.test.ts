import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRazorpayCheckout } from './razorpayCheckout';
import { WorkerEnv } from '../types';

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((header) => header?.replace('Bearer ', '') || null),
  verifyFirebaseToken: vi.fn(),
}));

vi.mock('../lib/firestoreAdmin', () => ({
  queryUserDocuments: vi.fn(),
}));

vi.mock('../lib/razorpayClient', () => ({
  createRazorpaySubscription: vi.fn(),
  createRazorpayOrder: vi.fn(),
}));

import { verifyFirebaseToken } from '../lib/firebaseAuth';
import { queryUserDocuments } from '../lib/firestoreAdmin';
import { createRazorpaySubscription, createRazorpayOrder } from '../lib/razorpayClient';

describe('POST /api/razorpay/checkout', () => {
  const mockEnv: WorkerEnv = {
    RAZORPAY_KEY_ID: 'rzp_test_mockKey',
    RAZORPAY_KEY_SECRET: 'mockSecret',
    RAZORPAY_PLAN_MONTHLY: 'plan_monthly_123',
    RAZORPAY_PLAN_ANNUAL: 'plan_annual_456',
    RAZORPAY_FOUNDING_AMOUNT: '1199900', // ₹11,999 in paise
    FIREBASE_PROJECT_ID: 'test-project',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Authentication required');
  });

  it('returns 401 when token verification fails', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);

    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_token',
      },
      body: JSON.stringify({ plan: 'monthly' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Invalid authentication token');
  });

  it('returns 400 when plan is missing or invalid', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user_1', email: 'user@test.com' } as any);

    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ plan: 'invalid_tier' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid plan');
  });

  it('returns 404 when user has no workspace', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user_1', email: 'user@test.com' } as any);
    vi.mocked(queryUserDocuments).mockResolvedValue([]);

    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ plan: 'monthly' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('Workspace not found');
  });

  it('creates Razorpay subscription for monthly plan and returns subscriptionId', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user_1', email: 'founder@saas.com' } as any);
    vi.mocked(queryUserDocuments).mockResolvedValue([{ id: 'ws_test_1', data: { name: 'My SaaS' } }]);
    vi.mocked(createRazorpaySubscription).mockResolvedValue({
      id: 'sub_test_monthly_999',
      status: 'created',
    });

    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ plan: 'monthly' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('subscription');
    expect(data.subscriptionId).toBe('sub_test_monthly_999');
    expect(data.keyId).toBe('rzp_test_mockKey');
    expect(createRazorpaySubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'plan_monthly_123',
        notes: expect.objectContaining({
          workspaceId: 'ws_test_1',
          plan: 'monthly',
        }),
      }),
      mockEnv
    );
  });

  it('creates Razorpay one-time order for founding lifetime plan', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user_1', email: 'founding@saas.com' } as any);
    vi.mocked(queryUserDocuments).mockResolvedValue([{ id: 'ws_founding_1', data: { name: 'Founding Co' } }]);
    vi.mocked(createRazorpayOrder).mockResolvedValue({
      id: 'order_test_lifetime_888',
      amount: 1199900,
      currency: 'INR',
    });

    const req = new Request('https://pandapraise.com/api/razorpay/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ plan: 'founding' }),
    });

    const res = await handleRazorpayCheckout(req, mockEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('order');
    expect(data.orderId).toBe('order_test_lifetime_888');
    expect(data.amount).toBe(1199900);
    expect(data.currency).toBe('INR');
    expect(createRazorpayOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1199900,
        currency: 'INR',
        notes: expect.objectContaining({
          workspaceId: 'ws_founding_1',
          plan: 'founding',
        }),
      }),
      mockEnv
    );
  });
});
