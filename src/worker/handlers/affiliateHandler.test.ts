import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAffiliatesApi } from './affiliateHandler';
import { WorkerEnv } from '../types';

describe('Self-Serve Affiliate & Partner Engine (Task 3.4)', () => {
  const mockEnv: WorkerEnv = {} as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/affiliates/register', () => {
    it('validates required fields: email, name, slug', async () => {
      const req = new Request('https://pandapraise.com/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'partner@growth.com' }),
      });

      const res = await handleAffiliatesApi(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('slug, name, and email are required');
    });

    it('successfully registers an affiliate and sets 30% standard commission rate', async () => {
      const req = new Request('https://pandapraise.com/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'growthmarketer',
          name: 'Sarah Connor',
          email: 'sarah@skynetgrowth.com',
          tier: 'standard',
        }),
      });

      const res = await handleAffiliatesApi(req, mockEnv);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.affiliate.slug).toBe('growthmarketer');
      expect(data.affiliate.commissionRate).toBe(0.3);
      expect(data.referralUrl).toContain('/r/growthmarketer');
    });

    it('sets 40% commission rate for agency tier partners', async () => {
      const req = new Request('https://pandapraise.com/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'venturemedia',
          name: 'Venture Media Agency',
          email: 'partners@venturemedia.com',
          tier: 'agency',
        }),
      });

      const res = await handleAffiliatesApi(req, mockEnv);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.affiliate.tier).toBe('agency');
      expect(data.affiliate.commissionRate).toBe(0.4);
    });
  });

  describe('GET /api/affiliates/stats', () => {
    it('returns affiliate statistics including clicks, conversions, and unpaid earnings', async () => {
      const req = new Request('https://pandapraise.com/api/affiliates/stats?slug=growthmarketer', {
        method: 'GET',
      });

      const res = await handleAffiliatesApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.stats).toBeDefined();
      expect(data.stats.commissionRate).toBe(0.3);
      expect(data.stats.clicks).toBe(0);
      expect(data.stats.conversions).toBe(0);
      expect(data.stats.totalRevenueAttributedUsd).toBe(0);
      expect(data.stats.unpaidEarningsUsd).toBe(0);
    });
  });

  describe('POST /api/affiliates/payout-link', () => {
    it('returns Stripe Connect Express onboarding URL for payout setup', async () => {
      const req = new Request('https://pandapraise.com/api/affiliates/payout-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'growthmarketer' }),
      });

      const res = await handleAffiliatesApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.onboardingUrl).toBeDefined();
      expect(data.onboardingUrl).toContain('stripe.com');
    });
  });
});
