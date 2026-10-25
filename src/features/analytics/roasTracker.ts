export interface AdAttributionRecord {
  adId: string;
  reviewId: string;
  productTitle: string;
  impressions: number;
  clicks: number;
  ordersCount: number;
  totalRevenueInr: number;
  adSpendInr: number;
}

/**
 * Calculates ROAS and conversion metrics for review-to-ad campaigns
 */
export function calculateAdPerformance(record: AdAttributionRecord): {
  ctr: string;
  roas: string;
  cpaInr: string;
} {
  const { impressions, clicks, ordersCount, totalRevenueInr, adSpendInr } = record;

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  const roas = adSpendInr > 0 ? (totalRevenueInr / adSpendInr).toFixed(2) : '0.00';
  const cpaInr = ordersCount > 0 ? (adSpendInr / ordersCount).toFixed(0) : '0';

  return {
    ctr: `${ctr}%`,
    roas: `${roas}x`,
    cpaInr: `₹${cpaInr}`,
  };
}

/**
 * Aggregates analytics across all review-based ad campaigns for Indian merchants
 */
export function summarizeMerchantAnalytics(records: AdAttributionRecord[]) {
  const totals = records.reduce(
    (acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      orders: acc.orders + curr.ordersCount,
      revenue: acc.revenue + curr.totalRevenueInr,
      spend: acc.spend + curr.adSpendInr,
    }),
    { impressions: 0, clicks: 0, orders: 0, revenue: 0, spend: 0 }
  );

  const overallRoas = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : '0.00';

  return {
    ...totals,
    revenueFormatted: `₹${totals.revenue.toLocaleString('en-IN')}`,
    spendFormatted: `₹${totals.spend.toLocaleString('en-IN')}`,
    overallRoas: `${overallRoas}x`,
  };
}
