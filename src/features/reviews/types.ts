/**
 * Review Ingestion & High-Intent Parsing Types
 */

export type ReviewSource = 
  | 'judge_me'
  | 'loox'
  | 'yotpo'
  | 'okendo'
  | 'shopify_reviews'
  | 'whatsapp'
  | 'direct_form';

export type ReviewMediaType = 'text' | 'image' | 'video';

export interface RawReview {
  id: string;
  source: ReviewSource;
  authorName: string;
  authorCity?: string;
  authorPhone?: string;
  rating: number; // 1 to 5
  title?: string;
  body: string;
  mediaType: ReviewMediaType;
  mediaUrls?: string[];
  productTitle: string;
  productId?: string;
  verifiedBuyer: boolean;
  createdAt: string;
}

export type ReviewIntentCategory = 
  | 'before_after'          // e.g. "My acne cleared up in 14 days"
  | 'skeptic_converted'     // e.g. "Was doubtful about buying from Insta, but wow"
  | 'feature_delight'       // e.g. "Pockets are huge, fabric is breathable"
  | 'social_compliments'    // e.g. "Everyone asked me where I got this kurta"
  | 'repeat_buyer'          // e.g. "Bought 3 more colors immediately"
  | 'problem_solved';       // e.g. "Fixed my lower back pain completely"

export interface ParsedHighIntentReview {
  id: string;
  rawReviewId: string;
  authorName: string;
  authorCity?: string;
  productTitle: string;
  originalBody: string;
  cleanedText: string;
  intentCategory: string;
  isCodMentioned?: boolean;
  mediaType: ReviewMediaType;
  mediaUrl?: string;
  intentScore: number; // 0 to 100
  categories: ReviewIntentCategory[];
  extractedKeyPhrase: string;
  suggestedAdAngles: string[];
  isEligibleForMetaAd: boolean; // intentScore >= 60
}
