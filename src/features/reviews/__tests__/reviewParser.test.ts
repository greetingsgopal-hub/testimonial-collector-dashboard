import { describe, it, expect } from 'vitest';
import { parseReviewInput } from '../reviewParser';
import { filterAndRankReviews } from '../intentFilter';

describe('Phase 2: Indian D2C Review Parser & Intent Filter', () => {
  it('strips WhatsApp timestamps, detects Indian city, and flags COD trust', () => {
    const whatsappMsg =
      '[11:45 AM, 25/10/2026] Anjali: Ordered first time on COD in Jaipur. Fabric is pure cotton and super comfortable!';

    const parsed = parseReviewInput(whatsappMsg, 'wa-1');

    expect(parsed.cleanedText).not.toContain('[11:45 AM');
    expect(parsed.buyerCity).toBe('Jaipur');
    expect(parsed.isCodMentioned).toBe(true);
    expect(parsed.intentScore).toBeGreaterThanOrEqual(75);
  });

  it('filters out low-effort 2-word reviews and ranks high-intent reviews first', () => {
    const rawInputs = [
      'Nice product',
      'Ordered this kurta for my mom in Mumbai on COD. Fast delivery in 2 days and stitching quality is worth every penny!',
      'Okay item',
    ];

    const parsed = rawInputs.map((text, i) => parseReviewInput(text, `rev-${i}`));
    const ranked = filterAndRankReviews(parsed, { minScore: 55 });

    expect(ranked.length).toBe(1);
    expect(ranked[0].buyerCity).toBe('Mumbai');
    expect(ranked[0].extractedKeywords.length).toBeGreaterThan(1);
  });
});
