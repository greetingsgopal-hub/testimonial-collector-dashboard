import { describe, it, expect } from 'vitest';
import { parseRawReviews, filterHighIntentReviews } from '../index';

describe('Review Parser & Intent Filter Pipeline', () => {
  it('parses raw reviews from Judge.me export format', () => {
    const rawData = [
      {
        id: 'jm_101',
        reviewer_name: 'Rahul Sharma',
        reviewer_location: 'Mumbai',
        rating: 5,
        title: 'Best fitting oversized tee!',
        body: 'Was skeptical about buying from an Instagram ad, but the fabric is breathable pure cotton and the packaging was luxurious. Already ordered 2 more colors!',
        product_title: 'Oversized Streetwear Tee',
      },
    ];

    const parsed = parseRawReviews(rawData, 'judge_me');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].authorName).toBe('Rahul Sharma');
    expect(parsed[0].authorCity).toBe('Mumbai');
    expect(parsed[0].rating).toBe(5);
    expect(parsed[0].productTitle).toBe('Oversized Streetwear Tee');
  });

  it('accurately detects high-intent customer testimonials and scores them for Meta Ads', () => {
    const reviews = [
      {
        id: '1',
        source: 'whatsapp' as const,
        authorName: 'Sneha Roy',
        authorCity: 'Kolkata',
        rating: 5,
        body: 'I was hesitant at first, but everyone asked where I got this! Difference was visible in 7 days.',
        mediaType: 'video' as const,
        mediaUrls: ['https://cdn.pandapraise.com/ugc/sneha.mp4'],
        productTitle: 'Brightening Vitamin C Serum',
        verifiedBuyer: true,
        createdAt: '2026-10-24T10:00:00Z',
      },
      {
        id: '2',
        source: 'shopify_reviews' as const,
        authorName: 'Anonymous',
        rating: 2,
        body: 'Delivery took too long.',
        mediaType: 'text' as const,
        productTitle: 'Standard Tee',
        verifiedBuyer: false,
        createdAt: '2026-10-24T10:00:00Z',
      },
    ];

    const scored = filterHighIntentReviews(reviews);
    expect(scored).toHaveLength(2);

    // Sneha Roy's review should score high and be ad-eligible
    const sneha = scored.find((s) => s.authorName === 'Sneha Roy')!;
    expect(sneha.intentScore).toBeGreaterThanOrEqual(60);
    expect(sneha.isEligibleForMetaAd).toBe(true);
    expect(sneha.categories).toContain('before_after');
    expect(sneha.categories).toContain('skeptic_converted');
    expect(sneha.categories).toContain('social_compliments');

    // Negative review should score low and not be eligible
    const anon = scored.find((s) => s.authorName === 'Anonymous')!;
    expect(anon.isEligibleForMetaAd).toBe(false);
  });
});
