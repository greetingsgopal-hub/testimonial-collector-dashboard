import { RawReview, ParsedHighIntentReview, ReviewIntentCategory } from './types';

/**
 * High-Intent Keyword Markers tailored for Indian D2C E-commerce.
 * Reviews containing these triggers yield highest Meta ROAS.
 */
const INTENT_PATTERNS: { category: ReviewIntentCategory; weight: number; regex: RegExp; angle: string }[] = [
  {
    category: 'before_after',
    weight: 35,
    regex: /\b(before and after|difference|results|cleared|improved|fixed|transformed|never going back|in \d+ days|within a week)\b/i,
    angle: 'Real Before & After Transformation',
  },
  {
    category: 'skeptic_converted',
    weight: 30,
    regex: /\b(skeptical|doubtful|hesitant|thought it was a scam|wasn't sure|insta(gram)? ad|exceeded expectations|pleasantly surprised|proved me wrong)\b/i,
    angle: 'Skeptic Turn Believer Hook',
  },
  {
    category: 'social_compliments',
    weight: 25,
    regex: /\b(everyone asked|compliments|strangers stopped me|family loved|my friends asked|where did you get|so many people complimented)\b/i,
    angle: 'Social Proof & Compliment Magnet',
  },
  {
    category: 'repeat_buyer',
    weight: 25,
    regex: /\b(already ordered|buying again|second time|3rd order|ordered another|another pair|more colors|repeat customer|lifetime customer)\b/i,
    angle: 'Obsessed Repeat Customer Proof',
  },
  {
    category: 'feature_delight',
    weight: 20,
    regex: /\b(deep pockets|fabric|breathable|pure cotton|pure silk|stitch(ing)?|finish|quality is insane|packaging|luxurious|worth every rupee|value for money)\b/i,
    angle: 'Product Quality & Craftsmanship Deep Dive',
  },
  {
    category: 'problem_solved',
    weight: 25,
    regex: /\b(finally found|saved my|no more|solution to|stopped my|struggling with|relief)\b/i,
    angle: 'Pain Point Solution Showcase',
  },
];

/**
 * Extracts the single punchiest sentence or phrase from a review.
 */
function extractPunchyKeyPhrase(text: string): string {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 15 && s.length < 120);
  if (sentences.length === 0) return text.slice(0, 100);

  // Pick sentence matching strongest intent regex
  for (const pattern of INTENT_PATTERNS) {
    const match = sentences.find((s) => pattern.regex.test(s));
    if (match) return match;
  }

  return sentences[0];
}

/**
 * Scores and filters raw reviews, highlighting high-intent reviews ready for Meta Ad generation.
 */
export function filterHighIntentReviews(reviews: RawReview[]): ParsedHighIntentReview[] {
  return reviews.map((rev) => {
    let score = 20; // Base score
    const matchedCategories: ReviewIntentCategory[] = [];
    const suggestedAngles: string[] = [];

    // Boost score for 5-star ratings
    if (rev.rating === 5) score += 15;
    else if (rev.rating === 4) score += 5;
    else score -= 30; // 3 stars or below penalized

    // Boost for media assets (videos are king on Meta)
    if (rev.mediaType === 'video') score += 35;
    else if (rev.mediaType === 'image') score += 15;

    // Check intent categories
    const combinedText = `${rev.title || ''} ${rev.body}`;
    for (const item of INTENT_PATTERNS) {
      if (item.regex.test(combinedText)) {
        if (!matchedCategories.includes(item.category)) {
          matchedCategories.push(item.category);
          score += item.weight;
          suggestedAngles.push(item.angle);
        }
      }
    }

    // Boost for verified buyer
    if (rev.verifiedBuyer) score += 5;

    // Minimum body length criteria
    if (rev.body.length < 25) score -= 15;

    const normalizedScore = Math.max(0, Math.min(100, score));
    const isEligible = normalizedScore >= 60;
    const mediaUrl = rev.mediaUrls && rev.mediaUrls.length > 0 ? rev.mediaUrls[0] : undefined;
    const isCodMentioned = /\b(cod|cash on delivery)\b/i.test(combinedText);
    const intentCategory = matchedCategories.length > 0 ? matchedCategories[0].replace(/_/g, ' ') : 'Customer Praise';

    return {
      id: `intent_${rev.id}`,
      rawReviewId: rev.id,
      authorName: rev.authorName,
      authorCity: rev.authorCity,
      productTitle: rev.productTitle,
      originalBody: rev.body,
      cleanedText: rev.body,
      intentCategory,
      isCodMentioned,
      mediaType: rev.mediaType,
      mediaUrl,
      intentScore: normalizedScore,
      categories: matchedCategories,
      extractedKeyPhrase: extractPunchyKeyPhrase(rev.body),
      suggestedAdAngles: suggestedAngles.length > 0 ? suggestedAngles : ['Verified Customer Recommendation'],
      isEligibleForMetaAd: isEligible,
    };
  }).sort((a, b) => b.intentScore - a.intentScore);
}

/**
 * Filter and rank reviews alias for direct component usage.
 */
export function filterAndRankReviews(reviews: RawReview[]): ParsedHighIntentReview[] {
  return filterHighIntentReviews(reviews);
}

