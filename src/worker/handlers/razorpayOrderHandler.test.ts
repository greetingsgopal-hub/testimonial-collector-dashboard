import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  verifySignature,
  handleRazorpayCreateOrder,
  handleRazorpayVerifyPayment,
  handleRazorpayOrderRoute,
} from './razorpayOrderHandler';

describe('Razorpay Order & Verification Handler Suite', () => {
  const secret = 'rzp_test_secret_key_123';
  const mockEnv = {
    RAZORPAY_KEY_ID: 'rzp_test_key_abc',
    RAZORPAY_KEY_SECRET: secret,
  };

  // Helper to compute expected HMAC-SHA256 signature
  async function computeExpectedSignature(orderId: string, paymentId: string, secretKey: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const data = encoder.encode(`${orderId}|${paymentId}`);
    const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifySignature', () => {
    it('returns true for a valid HMAC-SHA256 signature', async () => {
      const orderId = 'order_test_987';
      const paymentId = 'pay_test_654';
      const signature = await computeExpectedSignature(orderId, paymentId, secret);

      const isValid = await verifySignature(orderId, paymentId, signature, secret);
      expect(isValid).toBe(true);
    });

    it('returns false when signature does not match', async () => {
      const orderId = 'order_test_987';
      const paymentId = 'pay_test_654';
      const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      const isValid = await verifySignature(orderId, paymentId, forgedSignature, secret);
      expect(isValid).toBe(false);
    });

    it('returns false when parameters are missing', async () => {
      expect(await verifySignature('', 'pay_1', 'sig', secret)).toBe(false);
      expect(await verifySignature('order_1', '', 'sig', secret)).toBe(false);
      expect(await verifySignature('order_1', 'pay_1', '', secret)).toBe(false);
      expect(await verifySignature('order_1', 'pay_1', 'sig', '')).toBe(false);
    });
  });

  describe('POST /api/razorpay/create-order', () => {
    it('creates an order with default amount and currency', async () => {
      const mockOrderResponse = {
        id: 'order_default_123',
        amount: 249900,
        currency: 'INR',
        status: 'created',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockOrderResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await handleRazorpayCreateOrder(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        orderId: 'order_default_123',
        amount: 249900,
        currency: 'INR',
        keyId: 'rzp_test_key_abc',
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.razorpay.com/v1/orders',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it('creates an order with custom amount, currency, workspace, and taxId', async () => {
      const mockOrderResponse = {
        id: 'order_custom_456',
        amount: 2900,
        currency: 'USD',
        status: 'created',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockOrderResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 2900,
          currency: 'USD',
          workspace: 'Acme Growth',
          taxId: '27AADCB2230M1Z2',
        }),
      });

      const res = await handleRazorpayCreateOrder(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.orderId).toBe('order_custom_456');
      expect(data.amount).toBe(2900);
      expect(data.currency).toBe('USD');

      const calledBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(calledBody.amount).toBe(2900);
      expect(calledBody.currency).toBe('USD');
      expect(calledBody.notes.workspace).toBe('Acme Growth');
      expect(calledBody.notes.gstin).toBe('27AADCB2230M1Z2');
    });

    it('returns 400 when Razorpay API order creation fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { description: 'Currency not supported' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: 'XYZ' }),
      });

      const res = await handleRazorpayCreateOrder(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Currency not supported');
    });

    it('handles OPTIONS preflight request', async () => {
      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'OPTIONS',
      });
      const res = await handleRazorpayCreateOrder(req, mockEnv);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('POST /api/razorpay/verify-payment', () => {
    it('returns 400 for missing signature or payload fields', async () => {
      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razorpay_order_id: 'order_123' }),
      });

      const res = await handleRazorpayVerifyPayment(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Missing required fields');
    });

    it('returns 400 when HMAC signature verification fails', async () => {
      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_456',
          razorpay_signature: 'invalid_signature_hex',
        }),
      });

      const res = await handleRazorpayVerifyPayment(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid payment signature');
    });

    it('verifies signature and formats card payment instrument display', async () => {
      const orderId = 'order_valid_789';
      const paymentId = 'pay_card_01234';
      const signature = await computeExpectedSignature(orderId, paymentId, secret);

      // Mock Razorpay payment fetch response
      const mockPaymentDetails = {
        id: paymentId,
        amount: 249900,
        currency: 'INR',
        method: 'card',
        card: {
          last4: '4242',
          network: 'Visa',
          type: 'credit',
        },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockPaymentDetails), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      const res = await handleRazorpayVerifyPayment(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verified).toBe(true);
      expect(data.plan).toBe('Pro Plan');
      expect(data.paymentMethod).toEqual({
        type: 'card',
        headline: '•••• 4242',
        subtext: 'Visa • CREDIT',
      });
      expect(data.invoice.id).toMatch(/^INV-\d{4}-01234$/);
      expect(data.invoice.status).toBe('Paid');
      expect(data.invoice.amount).toBe('₹2,499');
    });

    it('verifies signature and formats UPI payment instrument display', async () => {
      const orderId = 'order_upi_111';
      const paymentId = 'pay_upi_99999';
      const signature = await computeExpectedSignature(orderId, paymentId, secret);

      const mockPaymentDetails = {
        id: paymentId,
        amount: 2900,
        currency: 'USD',
        method: 'upi',
        vpa: 'merchant@okaxis',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockPaymentDetails), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      const res = await handleRazorpayVerifyPayment(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verified).toBe(true);
      expect(data.paymentMethod).toEqual({
        type: 'upi',
        headline: 'merchant@okaxis',
        subtext: 'Verified UPI Mandate',
      });
      expect(data.invoice.amount).toBe('$29.00');
    });
  });

  describe('Universal handleRazorpayOrderRoute', () => {
    it('dispatches /create-order and /verify-payment accurately', async () => {
      const reqCreate = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'order_xyz', amount: 249900, currency: 'INR' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const res = await handleRazorpayOrderRoute(reqCreate, mockEnv);
      expect(res.status).toBe(200);

      const reqUnknown = new Request('https://pandapraise.com/api/razorpay/unknown', {
        method: 'GET',
      });
      const resUnknown = await handleRazorpayOrderRoute(reqUnknown, mockEnv);
      expect(resUnknown.status).toBe(404);
    });
  });

  describe('Full worker.fetch integration routing', () => {
    it('routes /api/razorpay/create-order through worker.fetch', async () => {
      const { default: worker } = await import('../index');
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'order_full_worker', amount: 249900, currency: 'INR' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await worker.fetch(req, mockEnv as any, {} as any);
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.orderId).toBe('order_full_worker');
    }, 15000);

    it('routes /api/razorpay/verify-payment through worker.fetch', async () => {
      const { default: worker } = await import('../index');
      const orderId = 'order_w_1';
      const paymentId = 'pay_w_1';
      const signature = await computeExpectedSignature(orderId, paymentId, secret);

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: paymentId,
            amount: 249900,
            currency: 'INR',
            method: 'card',
            card: { last4: '1234', network: 'MasterCard', type: 'debit' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });
      const res = await worker.fetch(req, mockEnv as any, {} as any);
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.verified).toBe(true);
      expect(data.paymentMethod.headline).toBe('•••• 1234');
    });
  });

  describe('Sandbox / Test Mode Fallback (Zero Config Required)', () => {
    it('creates sandbox order when env secrets are missing', async () => {
      const emptyEnv = {};
      const req = new Request('https://pandapraise.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 39900, currency: 'INR', planId: 'pro', userId: 'user_sandbox_1' }),
      });

      const res = await handleRazorpayCreateOrder(req, emptyEnv as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sandbox).toBe(true);
      expect(data.orderId).toContain('order_sandbox_');
      expect(data.amount).toBe(39900);
      expect(data.keyId).toBe('rzp_test_sandboxPandaPraise');
    });

    it('verifies sandbox payment successfully without secret key', async () => {
      const emptyEnv = {};
      const req = new Request('https://pandapraise.com/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: 'order_sandbox_123',
          razorpay_payment_id: 'pay_sandbox_456',
          razorpay_signature: 'sandbox_signature_789',
          planId: 'pro',
          userId: 'user_sandbox_1',
        }),
      });

      const res = await handleRazorpayVerifyPayment(req, emptyEnv as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verified).toBe(true);
      expect(data.paymentMethod.headline).toContain('Sandbox Verified');
      expect(data.planId).toBe('pro');
    });
  });
});


