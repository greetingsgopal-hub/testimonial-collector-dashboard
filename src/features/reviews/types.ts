export type ReviewSource = 
  | 'judgeme' 
  | 'loox' 
  | 'whatsapp' 
  | 'shopify_csv' 
  | 'manual'
  | 'judge_me'
  | 'shopify_reviews'
  | 'direct_form';

export type ReviewIntentCategory =
  | 'cod_trust'          // Overcomes Cash on Delivery / scam skepticism
  | 'quality_proof'      // Fabric, build, authenticity, skin/health results
  | 'fast_delivery'      // Speed of shipping, packaging safety
  | 'value_for_money'    // "Worth every penny", "Paisa vasool", better than expensive brands
  | 'gifting_emotion'    // Ordered for mom, wife, sister, festive wear
  | 'general_praise';    // Low-intent generic praise

export interface RawReviewInput {
  id?: string;
  body: string;
  author?: string;
  authorName?: string;
  rating?: number;
  productTitle?: string;
  productHandle?: string;
  buyerCity?: string;
  authorCity?: string;
  source?: ReviewSource;
  verifiedBuyer?: boolean;
  mediaType?: 'text' | 'image' | 'video';
  mediaUrl?: string;
  mediaUrls?: string[];
  createdAt?: string;
}

// Backward compatible alias
export type RawReview = RawReviewInput;

export interface ParsedHighIntentReview {
  id: string;
  originalText: string;
  cleanedText: string;
  author: string;
  authorName?: string;
  buyerCity: string;
  authorCity?: string;
  productTitle: string;
  rating: number;
  source: ReviewSource;
  intentScore: number; // 0 to 100
  intentCategory: ReviewIntentCategory;
  isCodMentioned: boolean;
  isDeliveryMentioned: boolean;
  isRepeatBuyer: boolean;
  extractedKeywords: string[];
  extractedKeyPhrase?: string;
  adAngleSuggestion: string;
  suggestedAdAngles?: string[];
  mediaType?: 'text' | 'image' | 'video';
  mediaUrl?: string;
  isEligibleForMetaAd?: boolean;
}
