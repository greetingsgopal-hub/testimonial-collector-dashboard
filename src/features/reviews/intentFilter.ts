import { ParsedHighIntentReview } from './types';

export interface FilterOptions {
  minScore?: number;
  minRating?: number;
  onlyCod?: boolean;
  category?: string;
}

/**
 * Filters out low-value reviews and ranks the top candidates by Meta Ad conversion score
 */
export function filterAndRankReviews(
  reviews: ParsedHighIntentReview[],
  options: FilterOptions = {}
): ParsedHighIntentReview[] {
  const { minScore = 50, minRating = 4, onlyCod = false, category } = options;

  return reviews
    .filter((rev) => {
      if (rev.cleanedText.split(' ').length < 4) return false; // Reject "Good", "Nice product"
      if (rev.rating < minRating) return false;
      if (rev.intentScore < minScore) return false;
      if (onlyCod && !rev.isCodMentioned) return false;
      if (category && category !== 'all' && rev.intentCategory !== category) return false;
      return true;
    })
    .sort((a, b) => b.intentScore - a.intentScore);
}

// Backward-compatible alias
export const filterHighIntentReviews = filterAndRankReviews;
