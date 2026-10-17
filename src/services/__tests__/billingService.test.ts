import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSecureRazorpayCheckout, calculateEvaluationMetrics } from '../billingService';

describe('billingService Test Suite', () => {
  describe('calculateEvaluationMetrics', () => {
    it('returns 0.0 avgRating when testimonials array is empty (No fake 5.0)', () => {
      const result = calculateEvaluationMetrics([]);
      expect(result.totalCount).toBe(0);
      expect(result.approvedCount).toBe(0);
      expect(result.avgRating).toBe(0.0);
    });

    it('returns 0.0 avgRating when all testimonials are pending', () => {
      const testimonials = [
        { id: '1', rating: 5, status: 'pending' },
        { id: '2', rating: 4, status: 'pending' },
      ];
      const result = calculateEvaluationMetrics(testimonials);
      expect(result.totalCount).toBe(2);
      expect(result.approvedCount).toBe(0);
      expect(result.avgRating).toBe(0.0);
    });

    it('calculates accurate avgRating across approved testimonials only', () => {
      const testimonials = [
        { id: '1', rating: 5, status: 'approved' },
        { id: '2', rating: 4, status: 'approved' },
        { id: '3', rating: 1, status: 'rejected' },
      ];
      const result = calculateEvaluationMetrics(testimonials);
      expect(result.totalCount).toBe(3);
      expect(result.approvedCount).toBe(2);
      expect(result.avgRating).toBe(4.5);
    });
  });

  describe('runSecureRazorpayCheckout', () => {
    let mockRazorpayInstance: any;

    beforeEach(() => {
      vi.restoreAllMocks();

      mockRazorpayInstance = {
        open: vi.fn(),
        on: vi.fn(),
      };

      (window as any).Razorpay = vi.fn(function (this: any, options: any) {
        mockRazorpayInstance.options = options;
        return mockRazorpayInstance;
      });

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/createRazorpayOrder')) {
          return {
            ok: true,
            json: async () => ({ orderId: 'order_real_123' }),
          };
        }
        if (url.includes('/verifyRazorpayPayment')) {
          return {
            ok: true,
            json: async () => ({ success: true, verified: true }),
          };
        }
        return { ok: false };
      });
    });

    it('calls onCancelOrError when modal is dismissed without upgrading plan', async () => {
      const onSuccess = vi.fn();
      const onCancelOrError = vi.fn();

      await runSecureRazorpayCheckout({
        workspaceId: 'ws_test_123',
        workspaceName: 'Acme Potato',
        billingEmail: 'billing@acme.com',
        taxId: '27AADCB2230M1Z2',
        planId: 'pro',
        planLabel: 'Pro Plan',
        amountMajor: 2499,
        currency: 'INR',
        onSuccess,
        onCancelOrError,
      });

      expect((window as any).Razorpay).toHaveBeenCalled();
      expect(mockRazorpayInstance.open).toHaveBeenCalled();

      // Trigger dismiss
      mockRazorpayInstance.options.modal.ondismiss();
      expect(onCancelOrError).toHaveBeenCalledWith('Checkout cancelled.');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('verifies signature with backend and invokes onSuccess on success', async () => {
      const onSuccess = vi.fn();
      const onCancelOrError = vi.fn();

      await runSecureRazorpayCheckout({
        workspaceId: 'ws_test_123',
        workspaceName: 'Acme Potato',
        billingEmail: 'billing@acme.com',
        taxId: '27AADCB2230M1Z2',
        planId: 'pro',
        planLabel: 'Pro Plan',
        amountMajor: 2499,
        currency: 'INR',
        onSuccess,
        onCancelOrError,
      });

      // Simulate successful payment
      await mockRazorpayInstance.options.handler({
        razorpay_payment_id: 'pay_real_999',
        razorpay_order_id: 'order_real_123',
        razorpay_signature: 'valid_sig_123',
      });

      expect(onSuccess).toHaveBeenCalledWith('pay_real_999');
      expect(onCancelOrError).not.toHaveBeenCalled();
    });

    it('does NOT invoke onSuccess if backend verification fails', async () => {
      const onSuccess = vi.fn();
      const onCancelOrError = vi.fn();

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/createRazorpayOrder')) {
          return {
            ok: true,
            json: async () => ({ orderId: 'order_real_123' }),
          };
        }
        if (url.includes('/verifyRazorpayPayment')) {
          return {
            ok: false,
            json: async () => ({ error: 'Invalid HMAC signature' }),
          };
        }
        return { ok: false };
      });

      await runSecureRazorpayCheckout({
        workspaceId: 'ws_test_123',
        workspaceName: 'Acme Potato',
        billingEmail: 'billing@acme.com',
        taxId: '27AADCB2230M1Z2',
        planId: 'pro',
        planLabel: 'Pro Plan',
        amountMajor: 2499,
        currency: 'INR',
        onSuccess,
        onCancelOrError,
      });

      // Simulate payment with bad signature
      await mockRazorpayInstance.options.handler({
        razorpay_payment_id: 'pay_bad_999',
        razorpay_order_id: 'order_real_123',
        razorpay_signature: 'forged_sig',
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onCancelOrError).toHaveBeenCalledWith('Invalid HMAC signature');
    });
  });
});
