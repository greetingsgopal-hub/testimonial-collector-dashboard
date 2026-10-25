import { RawReviewInput, ParsedHighIntentReview, ReviewIntentCategory, ReviewSource } from './types';

const INDIAN_CITIES = [
  'delhi', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata',
  'pune', 'ahmedabad', 'jaipur', 'lucknow', 'surat', 'chandigarh', 'indore',
  'noida', 'gurgaon', 'gurugram', 'kochi', 'patna', 'bhopal', 'ludhiana', 'agra'
];

const KEYWORD_DICTIONARY: Record<ReviewIntentCategory, string[]> = {
  cod_trust: ['cod', 'cash on delivery', 'prepaid', 'trust', 'genuine', 'authentic', 'legit', 'no scam', 'first time ordered'],
  quality_proof: ['fabric', 'cotton', 'material', 'stitching', 'results', 'glow', 'acne', 'fit', 'comfortable', 'soft', 'pure', 'original', 'finish'],
  fast_delivery: ['fast delivery', 'quick', 'days', 'packaging', 'packed', 'arrived early', 'on time', 'courier', 'before festival'],
  value_for_money: ['worth', 'paisa vasool', 'price', 'affordable', 'value for money', 'budget', 'deal', 'discount', 'cheaper than'],
  gifting_emotion: ['mom', 'mother', 'wife', 'sister', 'husband', 'gift', 'gifted', 'birthday', 'anniversary', 'diwali', 'wedding', 'loved it'],
  general_praise: ['good', 'nice', 'best', 'awesome', 'superb']
};

/**
 * Normalizes any review input (string or object) into a scored, Meta-Ad-ready candidate
 */
export function parseReviewInput(
  input: string | RawReviewInput,
  fallbackId: string = `rev-${Date.now()}`
): ParsedHighIntentReview {
  const raw: RawReviewInput = typeof input === 'string' ? { body: input } : input;
  const bodyText = raw.body || (raw as any).originalBody || (raw as any).text || '';

  // Clean WhatsApp timestamps, quotes, and extra whitespace
  const cleanedText = bodyText
    .replace(/^\[.*?\]\s*.*?:\s*/, '') // Strip WhatsApp "[10:30 AM, 25/10/2026] Customer: "
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = cleanedText.toLowerCase();

  // Detect Indian City if mentioned in text or payload
  let buyerCity = raw.buyerCity || raw.authorCity || 'India';
  if (buyerCity === 'India') {
    const foundCity = INDIAN_CITIES.find((city) => lower.includes(city));
    if (foundCity) {
      buyerCity = foundCity.charAt(0).toUpperCase() + foundCity.slice(1);
    }
  }

  // Extract Keywords & Determine Primary Intent Category
  const extractedKeywords: string[] = [];
  let bestCategory: ReviewIntentCategory = 'general_praise';
  let maxMatches = 0;

  (Object.keys(KEYWORD_DICTIONARY) as ReviewIntentCategory[]).forEach((category) => {
    if (category === 'general_praise') return;
    const matches = KEYWORD_DICTIONARY[category].filter((kw) => lower.includes(kw));
    if (matches.length > 0) {
      extractedKeywords.push(...matches);
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        bestCategory = category;
      }
    }
  });

  const isCodMentioned = KEYWORD_DICTIONARY.cod_trust.some((kw) => lower.includes(kw)) || lower.includes('cod');
  const isDeliveryMentioned = KEYWORD_DICTIONARY.fast_delivery.some((kw) => lower.includes(kw));
  const isRepeatBuyer = /second time|ordered again|repeat|3rd|another one/i.test(lower);

  // Calculate Meta Ad Conversion Intent Score (0 - 100)
  let score = 35; // Base score
  if (cleanedText.length >= 50 && cleanedText.length <= 280) score += 20; // Ideal ad copy length
  if (cleanedText.length > 280) score += 10;
  score += Math.min(25, extractedKeywords.length * 8); // Specific D2C proof points
  if (isCodMentioned) score += 10;
  if (isRepeatBuyer) score += 10;
  if (buyerCity !== 'India') score += 5; // Regional social proof boost

  const intentScore = Math.min(100, score);
  const author = raw.author || raw.authorName || 'Verified Buyer';

  return {
    id: raw.id || fallbackId,
    originalText: bodyText,
    cleanedText,
    author,
    authorName: author,
    buyerCity,
    authorCity: buyerCity,
    productTitle: raw.productTitle || 'Featured Product',
    rating: raw.rating ?? 5,
    source: raw.source || 'manual',
    intentScore,
    intentCategory: bestCategory,
    isCodMentioned,
    isDeliveryMentioned,
    isRepeatBuyer,
    extractedKeywords: Array.from(new Set(extractedKeywords)).slice(0, 5),
    extractedKeyPhrase: extractedKeywords.length > 0 ? extractedKeywords.join(', ') : cleanedText.slice(0, 50),
    adAngleSuggestion: getAdAngleSuggestion(bestCategory, buyerCity, isCodMentioned),
    suggestedAdAngles: [getAdAngleSuggestion(bestCategory, buyerCity, isCodMentioned)],
    mediaType: raw.mediaType || (raw.mediaUrl ? 'video' : 'text'),
    mediaUrl: raw.mediaUrl,
    isEligibleForMetaAd: intentScore >= 50,
  };
}

function getAdAngleSuggestion(
  category: ReviewIntentCategory,
  city: string,
  isCod: boolean
): string {
  if (isCod) return `Trust-Builder Hook: Highlight hassle-free COD & verified delivery to ${city}.`;
  switch (category) {
    case 'quality_proof':
      return 'Product Close-Up + Quote Overlay: Focus on material/results skepticism.';
    case 'gifting_emotion':
      return 'Emotional/Festive Hook: Position as the #1 family-approved gift.';
    case 'value_for_money':
      return 'Price-Anchor Hook: Compare premium quality against overpriced alternatives.';
    case 'fast_delivery':
      return `Speed & Reliability Hook: Emphasize express dispatch across ${city}.`;
    default:
      return 'Social Proof Wall: Combine with 5-star rating badge for retargeting.';
  }
}

/**
 * Backward-compatible multi-review parser for Judge.me / Loox arrays
 */
export function parseRawReviews(data: any[], source: ReviewSource = 'judgeme'): ParsedHighIntentReview[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, idx) => {
    const rawInput: RawReviewInput = {
      id: item.id ? String(item.id) : `rev-${idx}`,
      body: item.body || item.review || item.text || item.messageText || '',
      author: item.reviewer_name || item.author || item.name || item.authorName || 'Verified Buyer',
      buyerCity: item.reviewer_location || item.city || undefined,
      rating: Number(item.rating) || 5,
      productTitle: item.product_title || item.product_name || item.productTitle || 'Featured Product',
      source,
      mediaUrl: item.video_url || item.videoUrl || (item.pictures?.[0]?.url) || item.img_url,
    };
    return parseReviewInput(rawInput, rawInput.id);
  });
}
