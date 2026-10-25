import { describe, it, expect } from 'vitest';
import { calculateAdPerformance, summarizeMerchantAnalytics, AdAttributionRecord } from '../roasTracker';

describe('Phase 4: Indian D2C ROAS Analytics Tracker', () => {
  it('calculates CTR, ROAS, and CPA in INR accurately for a review ad campaign', () => {
    const record: AdAttributionRecord = {
      adId: 'ad-puneri-cotton-1',
      reviewId: 'rev-101',
      productTitle: 'Mulmul Cotton Kurti',
      impressions: 12500,
      clicks: 375,
      ordersCount: 25,
      totalRevenueInr: 49750,
      adSpendInr: 9950,
    };

    const metrics = calculateAdPerformance(record);

    expect(metrics.ctr).toBe('3.00%');
    expect(metrics.roas).toBe('5.00x');
    expect(metrics.cpaInr).toBe('₹398');
  });

  it('aggregates merchant analytics across multiple campaigns with Indian Rupee formatting', () => {
    const records: AdAttributionRecord[] = [
      {
        adId: 'ad-1',
        reviewId: 'rev-1',
        productTitle: 'Kurti',
        impressions: 10000,
        clicks: 300,
        ordersCount: 20,
        totalRevenueInr: 30000,
        adSpendInr: 6000,
      },
      {
        adId: 'ad-2',
        reviewId: 'rev-2',
        productTitle: 'Loafers',
        impressions: 20000,
        clicks: 500,
        ordersCount: 30,
        totalRevenueInr: 90000,
        adSpendInr: 15000,
      },
    ];

    const summary = summarizeMerchantAnalytics(records);

    expect(summary.impressions).toBe(30000);
    expect(summary.clicks).toBe(800);
    expect(summary.orders).toBe(50);
    expect(summary.revenue).toBe(120000);
    expect(summary.spend).toBe(21000);
    expect(summary.overallRoas).toBe('5.71x');
    expect(summary.revenueFormatted).toContain('₹');
    expect(summary.spendFormatted).toContain('₹');
  });

  it('handles zero spend and zero impressions gracefully without division by zero', () => {
    const emptyRecord: AdAttributionRecord = {
      adId: 'ad-empty',
      reviewId: 'rev-empty',
      productTitle: 'Empty',
      impressions: 0,
      clicks: 0,
      ordersCount: 0,
      totalRevenueInr: 0,
      adSpendInr: 0,
    };

    const metrics = calculateAdPerformance(emptyRecord);
    expect(metrics.ctr).toBe('0.00%');
    expect(metrics.roas).toBe('0.00x');
    expect(metrics.cpaInr).toBe('₹0');
  });
});
