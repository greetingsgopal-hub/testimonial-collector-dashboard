import { describe, it, expect } from 'vitest';
import { parseReviewInput } from '../../reviews/reviewParser';
import { generateMetaAdVariations, generateMetaAdCreative } from '../adGenerator';

describe('Phase 3: Indian D2C Meta Ad Creative Engine', () => {
  it('generates 3 distinct Meta Ad formats with regional city attribution and COD CTA', () => {
    const parsedReview = parseReviewInput({
      id: 'rev-101',
      body: 'Ordered on COD in Pune. The cotton kurti fabric is super soft and delivery took only 2 days!',
      author: 'Sneha Kulkarni',
      productTitle: 'Mulmul Cotton Kurti',
      rating: 5,
    });

    const creatives = generateMetaAdVariations(parsedReview);

    expect(creatives).toHaveLength(3);
    expect(creatives.map((c) => c.format)).toEqual(['9:16', '1:1', '4:5']);
    expect(creatives[0].ctaButton).toBe('Order on COD');
    expect(creatives[0].customerAttribution).toContain('Pune');
    expect(creatives[0].primaryText).toContain('Cash on Delivery Available');
  });

  it('generates rich viral hooks and metrics estimates for studio editor', () => {
    const parsedReview = parseReviewInput({
      id: 'rev-102',
      body: 'I was hesitant about buying online in Jaipur, but the fabric is breathable pure cotton and fits like a dream.',
      author: 'Priya Sharma',
      productTitle: 'Handloom Anarkali Suit',
      rating: 5,
    });

    const studioCreative = generateMetaAdCreative(parsedReview, 'Riva Fashions');

    expect(studioCreative.customerName).toBe('Priya Sharma');
    expect(studioCreative.productTitle).toBe('Handloom Anarkali Suit');
    expect(studioCreative.formats).toEqual(['9:16', '1:1', '4:5']);
    expect(studioCreative.hooks?.length).toBeGreaterThanOrEqual(3);
    expect(studioCreative.customerAttribution).toContain('Jaipur');
  });
});
