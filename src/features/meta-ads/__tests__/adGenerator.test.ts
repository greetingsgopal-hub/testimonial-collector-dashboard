import { describe, it, expect } from 'vitest';
import { generateMetaAdCreative } from '../index';
import { ParsedHighIntentReview } from '../../reviews/types';

describe('Meta Ads Generator Engine', () => {
  it('generates 3 viral hooks and complete Indian D2C ad copy from high intent review', () => {
    const review: ParsedHighIntentReview = {
      id: 'intent_123',
      author: 'Aarav Gupta',
      authorName: 'Aarav Gupta',
      buyerCity: 'Jaipur',
      authorCity: 'Jaipur',
      productTitle: 'Handcrafted Kolhapuri Leather Loafers',
      originalText: 'The fitting is unbelievable and everyone at the wedding asked where I bought this from!',
      cleanedText: 'The fitting is unbelievable and everyone at the wedding asked where I bought this from!',
      intentCategory: 'quality_proof',
      source: 'whatsapp',
      rating: 5,
      isCodMentioned: false,
      isDeliveryMentioned: false,
      isRepeatBuyer: false,
      mediaType: 'video',
      mediaUrl: 'https://cdn.pandapraise.com/ugc/aarav.mp4',
      intentScore: 88,
      extractedKeywords: ['fitting', 'wedding'],
      extractedKeyPhrase: 'everyone at the wedding asked where I bought this from',
      adAngleSuggestion: 'Social Proof & Compliment Magnet',
      suggestedAdAngles: ['Social Proof & Compliment Magnet'],
      isEligibleForMetaAd: true,
    };

    const creative = generateMetaAdCreative(review, 'Royal Footwear');

    expect(creative.customerName).toBe('Aarav Gupta');
    expect(creative.productName).toBe('Handcrafted Kolhapuri Leather Loafers');
    expect(creative.formats).toEqual(['9:16', '1:1', '4:5']);
    expect(creative.hooks.length).toBeGreaterThanOrEqual(3);
    expect(creative.copy.trustBadges).toContain('Cash on Delivery Available');
    expect(creative.copy.primaryText).toContain('Jaipur');
    expect(creative.copy.primaryText).toContain('Royal Footwear');
    expect(creative.copy.headline).toContain('everyone at the wedding asked');
    expect(creative.metricsEstimate.estCtr).toBe('2.84%');
    expect(creative.metricsEstimate.targetRoas).toBe('4.8x');
  });
});
