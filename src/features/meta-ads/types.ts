import { ReviewIntentCategory } from '../reviews/types';

export type MetaAdFormat = '9:16' | '1:1' | '4:5';

export type VisualTemplateStyle =
  | 'whatsapp_chat_proof'   // Looks like a real WhatsApp customer feedback screenshot
  | 'founder_quote_card'    // Minimalist high-contrast D2C quote card with product badge
  | 'cod_trust_banner';     // Heavy trust badges (COD, 7-Day Exchange, Fast Delivery)

export interface MetaAdHook {
  angle: 'skepticism_buster' | 'regional_social_proof' | 'value_anchor' | string;
  headline: string;
  subheadline: string;
  type?: string;
  label?: string;
  hookText?: string;
  onScreenDurationSec?: number;
}

export interface MetaAdCopy {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: 'Shop Now' | 'Order on COD' | 'Get Offer' | 'Order on WhatsApp' | 'Claim Offer' | string;
  trustBadges: string[];
}

export interface MetaAdCreative {
  id: string;
  reviewId: string;
  productTitle: string;
  format: MetaAdFormat;
  templateStyle: VisualTemplateStyle;
  hook: MetaAdHook;
  primaryText: string;
  headline: string;
  description: string;
  ctaButton: 'Shop Now' | 'Order on COD' | 'Get Offer' | string;
  trustBadges: string[];
  customerAttribution: string; // e.g., "Anjali M. • Verified Buyer (Jaipur)"
  intentCategory: ReviewIntentCategory;

  // Fully-typed studio & generator properties
  customerName: string;
  customerCity?: string;
  productName: string;
  videoUrl?: string;
  imageUrl?: string;
  formats: MetaAdFormat[];
  activeFormat: MetaAdFormat;
  hooks: MetaAdHook[];
  selectedHookIndex?: number;
  copy: MetaAdCopy;
  metricsEstimate: {
    estCtr: string;
    targetRoas: string;
  };
  createdAt?: string;
}
