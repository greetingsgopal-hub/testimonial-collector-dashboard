export type RichSnippetEntityType = 'Product' | 'SoftwareApplication';

export interface RatingSource {
  rating: number;
  status: string;
  isSample?: boolean;
  source?: string;
}

export interface RichSnippetInput {
  entityType: RichSnippetEntityType;
  name: string;
  url: string;
  description: string;
  reviews: RatingSource[];
}

/**
 * Creates review-snippet JSON-LD only from real, approved, non-sample ratings.
 * The caller must ensure these reviews and the aggregate rating are visible on
 * the target page and refer to the selected product/software entity.
 */
export function buildRichSnippetJsonLd(input: RichSnippetInput): string | null {
  const eligibleRatings = input.reviews
    .filter(
      (review) =>
        review.status === 'approved' &&
        review.isSample !== true &&
        review.source !== 'sample' &&
        Number.isFinite(review.rating) &&
        review.rating >= 1 &&
        review.rating <= 5,
    )
    .map((review) => review.rating);

  if (
    eligibleRatings.length === 0 ||
    !input.name.trim() ||
    !isValidHttpUrl(input.url)
  ) {
    return null;
  }

  const ratingValue =
    eligibleRatings.reduce((total, rating) => total + rating, 0) /
    eligibleRatings.length;

  const trimmedDescription = input.description.trim();

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': input.entityType,
    name: input.name.trim(),
    url: input.url.trim(),
    ...(trimmedDescription ? { description: trimmedDescription } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingValue.toFixed(2)),
      bestRating: 5,
      worstRating: 1,
      ratingCount: eligibleRatings.length,
    },
  };

  return JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
