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

export interface ReviewVariationInput {
  id?: string;
  originalText?: string;
  cleanedText?: string;
  author?: string;
  rating?: number;
  intentScore?: number;
  intentCategory?: string;
  isCodMentioned?: boolean;
  isDeliveryMentioned?: boolean;
  extractedKeywords?: string[];
}

/**
 * Generates 3 high-converting Meta Ad variations (Pattern-Interrupt Hook, Story Copy, CTA)
 * tailored for Indian D2C buyers.
 */
export function generateMetaAdVariations(
  reviewInput: ReviewVariationInput,
  productTitle: string = 'Handloom Cotton Kurti'
): MetaAdCreative[] {
  const author = reviewInput.author || 'Verified Customer';
  const text = reviewInput.cleanedText || reviewInput.originalText || '';
  const codBadge = reviewInput.isCodMentioned ? '🚚 Cash on Delivery (COD) Available' : '🚚 Fast Pan-India Delivery';

  const formats = ['9:16', '1:1', '4:5'];

  const hooks = [
    {
      headline: `Don't buy ${productTitle} until you read what happened to ${author.split(' ')[0]} ⚠️`,
      angle: 'Pattern Interrupt',
    },
    {
      headline: `I honestly thought Instagram brands were all hype... until this arrived 🤐`,
      angle: 'Skeptic to Believer',
    },
    {
      headline: `POV: You finally found the perfect ${productTitle} with deep pockets 🔥`,
      angle: 'Relatable POV',
    },
  ];

  return hooks.map((hook, idx) => {
    const fmt = formats[idx % formats.length];
    const primaryText = `"${text}"\n\n— ${author} ⭐⭐⭐⭐⭐\n\nUpgrade your daily wardrobe with the ${productTitle}. Handcrafted pure cotton with modern comfort.\n\n${codBadge}\n⚡ Dispatches within 24 Hours\n🔄 7-Day Easy Exchange Guarantee`;

    return {
      id: `creative-var-${idx + 1}-${Date.now()}`,
      format: fmt,
      activeFormat: fmt as any,
      formats: [fmt as any],
      hook: {
        headline: hook.headline,
        label: hook.angle,
      },
      hooks: [
        {
          type: 'curiosity_negative',
          label: hook.angle,
          hookText: hook.headline,
          onScreenDurationSec: 3,
        },
      ],
      primaryText,
      copy: {
        primaryText,
        headline: hook.headline,
        description: 'Rated 4.9/5 by 10,000+ D2C shoppers across India',
        callToAction: 'Shop Now',
        trustBadges: ['Cash on Delivery', '7-Day Exchange', 'Free Shipping'],
      },
      ctaButton: 'Shop Now',
      productName: productTitle,
      customerName: author,
      metricsEstimate: {
        estCtr: '2.84%',
        targetRoas: '4.8x',
      },
      createdAt: new Date().toISOString(),
    };
  });
}

