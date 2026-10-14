export interface AffiliateProfile {
  slug: string;
  name: string;
  email: string;
  tier: 'standard' | 'agency';
  commissionRate: number; // e.g. 0.30 for standard (30%), 0.40 for agency (40%)
  clicks: number;
  conversions: number;
  totalRevenueAttributedUsd: number;
  unpaidEarningsUsd: number;
  paidEarningsUsd: number;
  stripeConnected: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'pandapraise_affiliate_profile';

export function calculateCommission(saleAmountUsd: number, tier: 'standard' | 'agency' = 'standard'): number {
  const rate = tier === 'agency' ? 0.40 : 0.30;
  return Math.round(saleAmountUsd * rate * 100) / 100;
}

export function getStoredAffiliateProfile(): AffiliateProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAffiliateProfile(profile: AffiliateProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function createDefaultAffiliateProfile(
  slug: string,
  name: string,
  email: string,
  tier: 'standard' | 'agency' = 'standard'
): AffiliateProfile {
  return {
    slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
    name,
    email,
    tier,
    commissionRate: tier === 'agency' ? 0.40 : 0.30,
    clicks: 0,
    conversions: 0,
    totalRevenueAttributedUsd: 0,
    unpaidEarningsUsd: 0,
    paidEarningsUsd: 0,
    stripeConnected: false,
    createdAt: new Date().toISOString(),
  };
}

export function buildAffiliateReferralUrl(slug: string, origin: string = 'https://pandapraise.com'): string {
  return `${origin}/r/${slug}?ref=affiliate&aff_tier=30`;
}
