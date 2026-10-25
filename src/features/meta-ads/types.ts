/**
 * Meta Ads Engine Types for Indian Shopify D2C Brands
 */

export type MetaAdFormat = '9:16' | '1:1' | '4:5';

export type HookType = 
  | 'curiosity_negative' 
  | 'skeptic_to_believer' 
  | 'relatable_pov' 
  | 'social_proof_viral';

export interface MetaAdHook {
  type: HookType;
  label: string;
  hookText: string;
  onScreenDurationSec: number;
}

export interface MetaAdCopy {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: 'Shop Now' | 'Order on WhatsApp' | 'Claim Offer';
  trustBadges: string[];
}

export interface MetaAdCreative {
  id: string;
  reviewId: string;
  customerName: string;
  customerCity?: string;
  productName: string;
  videoUrl?: string;
  imageUrl?: string;
  formats: MetaAdFormat[];
  activeFormat: MetaAdFormat;
  hooks: MetaAdHook[];
  selectedHookIndex: number;
  copy: MetaAdCopy;
  metricsEstimate: {
    estCtr: string;
    targetRoas: string;
  };
  createdAt: string;
}
