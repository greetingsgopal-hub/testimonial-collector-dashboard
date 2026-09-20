/**
 * Rich Snippets — Generate JSON-LD structured data for SEO.
 * Injects Review and AggregateRating schema into widget embed pages.
 */
import { Review, ReviewStats } from '../types';

export interface RichSnippetConfig {
  businessName: string;
  businessUrl?: string;
  businessLogoUrl?: string;
  businessDescription?: string;
}

/** Generate JSON-LD for a single review */
export function generateReviewJsonLd(review: Review, config: RichSnippetConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: config.businessName,
      ...(config.businessUrl && { url: config.businessUrl }),
      ...(config.businessLogoUrl && { image: config.businessLogoUrl }),
      ...(config.businessDescription && { description: config.businessDescription }),
    },
    author: {
      '@type': 'Person',
      name: review.name,
      ...(review.company && { worksFor: { '@type': 'Organization', name: review.company } }),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.content,
    datePublished: review.createdAt,
    ...(review.title && { name: review.title }),
  };
}

/** Generate JSON-LD for aggregate rating across all reviews */
export function generateAggregateRatingJsonLd(
  stats: ReviewStats,
  config: RichSnippetConfig
): object {
  if (stats.total === 0) return {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.businessName,
    ...(config.businessUrl && { url: config.businessUrl }),
    ...(config.businessLogoUrl && { image: config.businessLogoUrl }),
    ...(config.businessDescription && { description: config.businessDescription }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.averageRating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: stats.total,
      ratingCount: stats.total,
    },
  };
}

/** Generate a combined JSON-LD script tag content with both aggregate and individual reviews */
export function generateCombinedJsonLd(
  reviews: Review[],
  stats: ReviewStats,
  config: RichSnippetConfig
): string {
  const schemas: object[] = [];

  // Add aggregate rating
  if (stats.total > 0) {
    schemas.push(generateAggregateRatingJsonLd(stats, config));
  }

  // Add up to 10 individual reviews
  const topReviews = reviews
    .filter(r => r.status === 'approved' && r.rating >= 4)
    .slice(0, 10);

  for (const review of topReviews) {
    schemas.push(generateReviewJsonLd(review, config));
  }

  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2);
}

/** Inject JSON-LD into the page head */
export function injectJsonLd(jsonLd: string): void {
  // Remove any existing Panda Praise JSON-LD
  const existing = document.querySelector('script[data-panda-praise-jsonld]');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-panda-praise-jsonld', 'true');
  script.textContent = jsonLd;
  document.head.appendChild(script);
}

/** Remove injected JSON-LD from the page */
export function removeJsonLd(): void {
  const existing = document.querySelector('script[data-panda-praise-jsonld]');
  if (existing) existing.remove();
}
