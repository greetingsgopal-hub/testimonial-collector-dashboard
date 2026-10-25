import { ParsedHighIntentReview } from '../reviews/types';
import { MetaAdCreative, MetaAdHook, MetaAdCopy } from './types';

/**
 * AI & Template Ad Generator Engine
 * Transforms high-intent customer reviews into high-converting Meta Ads (copy + visual hooks + formats)
 * calibrated specifically for Indian Shopify D2C e-commerce brands.
 */

export function generateMetaAdCreative(
  review: ParsedHighIntentReview,
  brandName: string = 'Our Brand'
): MetaAdCreative {
  const product = review.productTitle || 'this product';
  const customer = review.authorName || 'Verified Customer';
  const city = review.authorCity ? ` from ${review.authorCity}` : '';

  // 1. Generate 3 Viral Hooks
  const hooks: MetaAdHook[] = [
    {
      type: 'curiosity_negative',
      label: '⚠️ Curiosity / Stop Scrolling',
      hookText: `Don't buy ${product} before watching this honest review ⚠️`,
      onScreenDurationSec: 3,
    },
    {
      type: 'skeptic_to_believer',
      label: '🔥 Skeptic to Believer',
      hookText: `I honestly thought Instagram brands were all hype... until this arrived 🤐`,
      onScreenDurationSec: 3,
    },
    {
      type: 'relatable_pov',
      label: '✨ Relatable POV',
      hookText: `POV: You finally stopped wasting money on cheap alternatives 🔥`,
      onScreenDurationSec: 3,
    },
    {
      type: 'social_proof_viral',
      label: '💬 Compliment Magnet',
      hookText: `Why literally everyone in my DMs asked where I bought this 👀`,
      onScreenDurationSec: 3,
    },
  ];

  // 2. Format High-Converting Meta Ad Copy
  const copy: MetaAdCopy = {
    primaryText: `"${review.extractedKeyPhrase}" — ${customer}${city}\n\nOver 10,000+ Indian shoppers upgraded to ${brandName}'s ${product}. Real results, premium quality, zero compromises.\n\n🚚 Cash on Delivery (COD) Available Pan-India\n⚡ Delivered in 3-5 Business Days\n🔄 7-Day Hassle-Free Exchange Policy`,
    headline: `"${review.extractedKeyPhrase.slice(0, 48)}..." ⭐⭐⭐⭐⭐`,
    description: `Rated 4.9/5 by 12,400+ Verified Buyers across India`,
    callToAction: 'Shop Now',
    trustBadges: [
      'Cash on Delivery Available',
      'Free Shipping Across India',
      '7-Day Easy Exchange',
      '100% Original Guarantee',
    ],
  };

  // 3. Est CTR & Target ROAS
  const estCtr = review.mediaType === 'video' ? '2.84%' : '1.92%';
  const targetRoas = review.mediaType === 'video' ? '4.8x' : '3.4x';

  return {
    id: `ad_${review.id}_${Date.now()}`,
    reviewId: review.id,
    customerName: customer,
    customerCity: review.authorCity,
    productName: product,
    videoUrl: review.mediaType === 'video' ? review.mediaUrl : '/demo_meta_ad.mp4',
    imageUrl: review.mediaType === 'image' ? review.mediaUrl : undefined,
    formats: ['9:16', '1:1', '4:5'],
    activeFormat: '9:16',
    hooks,
    selectedHookIndex: 0,
    copy,
    metricsEstimate: {
      estCtr,
      targetRoas,
    },
    createdAt: new Date().toISOString(),
  };
}
