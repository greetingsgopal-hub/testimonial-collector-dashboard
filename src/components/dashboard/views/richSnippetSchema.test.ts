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

  it('escapes user-provided text safely through JSON serialization and neutralizes script tags', () => {
    const result = buildRichSnippetJsonLd({
      ...base,
      name: 'Example "App" </script><script>alert(1)</script>',
      description: 'A \\ product with <tags>',
      reviews: [{ rating: 5, status: 'approved' }],
    });

    expect(result).not.toBeNull();
    // Raw </script> must not appear in the generated JSON-LD string to prevent HTML script breakout
    expect(result).not.toContain('</script>');
    expect(result).toContain('\\u003c/script>');
    expect(() => JSON.parse(result!)).not.toThrow();
    const parsed = JSON.parse(result!);
    expect(parsed.name).toBe('Example "App" </script><script>alert(1)</script>');
    expect(parsed.description).toBe('A \\ product with <tags>');
  });

  it('excludes reviews marked with source: sample', () => {
    expect(
      buildRichSnippetJsonLd({
        ...base,
        reviews: [
          { rating: 5, status: 'approved', source: 'sample' },
        ],
      }),
    ).toBeNull();
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
