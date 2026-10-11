import { describe, expect, it } from 'vitest';
import { buildRichSnippetJsonLd } from './richSnippetSchema';

const base = {
  entityType: 'SoftwareApplication' as const,
  name: 'Example App',
  url: 'https://example.com',
  description: 'Real customer feedback',
};

describe('buildRichSnippetJsonLd', () => {
  it('returns null when there are no reviews', () => {
    expect(buildRichSnippetJsonLd({ ...base, reviews: [] })).toBeNull();
  });

  it('returns null when reviews are pending or rejected', () => {
    expect(
      buildRichSnippetJsonLd({
        ...base,
        reviews: [
          { rating: 5, status: 'pending' },
          { rating: 1, status: 'rejected' },
        ],
      }),
    ).toBeNull();
  });

  it('excludes sample reviews and invalid ratings', () => {
    expect(
      buildRichSnippetJsonLd({
        ...base,
        reviews: [
          { rating: 5, status: 'approved', isSample: true },
          { rating: 6, status: 'approved' },
          { rating: 0, status: 'approved' },
        ],
      }),
    ).toBeNull();
  });

  it('calculates the rating and count from approved, non-sample reviews only', () => {
    const result = buildRichSnippetJsonLd({
      ...base,
      reviews: [
        { rating: 5, status: 'approved' },
        { rating: 4, status: 'approved' },
        { rating: 1, status: 'pending' },
        { rating: 5, status: 'approved', isSample: true },
      ],
    });

    expect(result).not.toBeNull();
    const schema = JSON.parse(result!);
    expect(schema.aggregateRating.ratingValue).toBe(4.5);
    expect(schema.aggregateRating.ratingCount).toBe(2);
    expect(schema.aggregateRating.reviewCount).toBeUndefined();
  });

  it('escapes user-provided text safely through JSON serialization', () => {
    const result = buildRichSnippetJsonLd({
      ...base,
      name: 'Example "App"',
      description: 'A \\ product',
      reviews: [{ rating: 5, status: 'approved' }],
    });

    expect(() => JSON.parse(result!)).not.toThrow();
    expect(JSON.parse(result!).name).toBe('Example "App"');
  });

  it('rejects missing names and non-HTTP URLs', () => {
    expect(
      buildRichSnippetJsonLd({
        ...base,
        name: ' ',
        reviews: [{ rating: 5, status: 'approved' }],
      }),
    ).toBeNull();
    expect(
      buildRichSnippetJsonLd({
        ...base,
        url: 'javascript:alert(1)',
        reviews: [{ rating: 5, status: 'approved' }],
      }),
    ).toBeNull();
  });
});
