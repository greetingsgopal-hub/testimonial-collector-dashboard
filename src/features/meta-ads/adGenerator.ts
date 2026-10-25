import { ParsedHighIntentReview } from '../reviews/types';
import { MetaAdCreative, MetaAdHook, MetaAdCopy } from './types';

/**
 * Generates 3 high-converting Meta Ad variations from a scored Indian D2C customer review
 */
export function generateMetaAdVariations(
  review: ParsedHighIntentReview,
  productTitleOverride?: string
): MetaAdCreative[] {
  const product = productTitleOverride || review.productTitle || 'Our Bestseller';
  const city = review.buyerCity && review.buyerCity !== 'India' 
    ? review.buyerCity 
    : (review.authorCity && review.authorCity !== 'India' ? review.authorCity : 'India');
  const authorName = review.author || review.authorName || 'Verified Buyer';
  const firstName = authorName.split(' ')[0] || 'Verified Buyer';
  const attribution = `${authorName} • Verified Buyer (${city})`;

  const defaultBadges = [
    review.isCodMentioned ? '✓ Cash on Delivery Available' : '✓ 100% Authentic Quality',
    '⚡ Express Shipping Across India',
    '🔄 7-Day Hassle-Free Exchange',
  ];

  const reviewText = review.cleanedText || review.originalText || '';

  // Variation 1: Skepticism Buster (9:16 Reels / Stories — WhatsApp Chat Style)
  const variation1: MetaAdCreative = {
    id: `${review.id}-var-1`,
    reviewId: review.id,
    productTitle: product,
    productName: product,
    customerName: authorName,
    customerCity: city,
    format: '9:16',
    activeFormat: '9:16',
    formats: ['9:16', '1:1', '4:5'],
    templateStyle: 'whatsapp_chat_proof',
    hook: {
      angle: 'skepticism_buster',
      headline: `Still wondering if ${product} is worth the hype? 👀`,
      subheadline: `See what ${firstName} from ${city} sent us after ordering:`,
      label: 'Skepticism Buster',
      hookText: `Still wondering if ${product} is worth the hype? 👀`,
      onScreenDurationSec: 3,
    },
    hooks: [
      {
        angle: 'skepticism_buster',
        headline: `Still wondering if ${product} is worth the hype? 👀`,
        subheadline: `See what ${firstName} from ${city} sent us after ordering:`,
        label: 'Skepticism Buster',
        hookText: `Still wondering if ${product} is worth the hype? 👀`,
        onScreenDurationSec: 3,
      },
    ],
    primaryText: [
      `"${reviewText}" — ${attribution} ⭐⭐⭐⭐⭐`,
      ``,
      `We get it. Ordering online in India can feel like a gamble. That's why 10,000+ customers across ${city} & beyond trust us for:`,
      ...defaultBadges.map((b) => `• ${b}`),
      ``,
      `Tap "Shop Now" to claim your ${product} before this batch sells out! 👇`,
    ].join('\n'),
    headline: `Rated 4.9/5 by Happy Customers in ${city} ⭐`,
    description: `Cash on Delivery Available | Easy 7-Day Returns`,
    ctaButton: review.isCodMentioned ? 'Order on COD' : 'Shop Now',
    trustBadges: defaultBadges,
    customerAttribution: attribution,
    intentCategory: review.intentCategory,
    copy: {
      primaryText: `"${reviewText}" — ${attribution} ⭐⭐⭐⭐⭐`,
      headline: `Rated 4.9/5 by Happy Customers in ${city} ⭐`,
      description: `Cash on Delivery Available | Easy 7-Day Returns`,
      callToAction: review.isCodMentioned ? 'Order on COD' : 'Shop Now',
      trustBadges: defaultBadges,
    },
    metricsEstimate: {
      estCtr: '2.84%',
      targetRoas: '4.8x',
    },
    createdAt: new Date().toISOString(),
  };

  // Variation 2: Regional Social Proof & Quality Card (1:1 Feed — Founder Quote Style)
  const variation2: MetaAdCreative = {
    id: `${review.id}-var-2`,
    reviewId: review.id,
    productTitle: product,
    productName: product,
    customerName: authorName,
    customerCity: city,
    format: '1:1',
    activeFormat: '1:1',
    formats: ['9:16', '1:1', '4:5'],
    templateStyle: 'founder_quote_card',
    hook: {
      angle: 'regional_social_proof',
      headline: `"Best decision I made this month!" ✨`,
      subheadline: `Why ${city} shoppers are switching to ${product}`,
      label: 'Regional Social Proof',
      hookText: `"Best decision I made this month!" ✨`,
      onScreenDurationSec: 3,
    },
    hooks: [
      {
        angle: 'regional_social_proof',
        headline: `"Best decision I made this month!" ✨`,
        subheadline: `Why ${city} shoppers are switching to ${product}`,
        label: 'Regional Social Proof',
        hookText: `"Best decision I made this month!" ✨`,
        onScreenDurationSec: 3,
      },
    ],
    primaryText: [
      `Don't just take our word for it. Here's ${firstName}'s honest experience with ${product}:`,
      ``,
      `💬 "${reviewText}"`,
      ``,
      `✅ Premium Quality Guaranteed`,
      `✅ COD & Prepaid Discounts Available`,
      `✅ Fast Doorstep Delivery`,
      ``,
      `Upgrade your routine with ${product} today!`,
    ].join('\n'),
    headline: `${product} — Loved Across India 🇮🇳`,
    description: ` Extra 10% OFF on Prepaid Orders`,
    ctaButton: 'Shop Now',
    trustBadges: defaultBadges,
    customerAttribution: attribution,
    intentCategory: review.intentCategory,
    copy: {
      primaryText: `Don't just take our word for it. Here's ${firstName}'s honest experience with ${product}:`,
      headline: `${product} — Loved Across India 🇮🇳`,
      description: ` Extra 10% OFF on Prepaid Orders`,
      callToAction: 'Shop Now',
      trustBadges: defaultBadges,
    },
    metricsEstimate: {
      estCtr: '2.45%',
      targetRoas: '3.9x',
    },
    createdAt: new Date().toISOString(),
  };

  // Variation 3: Direct ROI / "Paisa Vasool" Value Anchor (4:5 Vertical Feed — COD Banner)
  const variation3: MetaAdCreative = {
    id: `${review.id}-var-3`,
    reviewId: review.id,
    productTitle: product,
    productName: product,
    customerName: authorName,
    customerCity: city,
    format: '4:5',
    activeFormat: '4:5',
    formats: ['9:16', '1:1', '4:5'],
    templateStyle: 'cod_trust_banner',
    hook: {
      angle: 'value_anchor',
      headline: `Stop overpaying for average quality. 🛑`,
      subheadline: `Get 100% Paisa-Vasool quality with ${product}`,
      label: 'Value Anchor',
      hookText: `Stop overpaying for average quality. 🛑`,
      onScreenDurationSec: 3,
    },
    hooks: [
      {
        angle: 'value_anchor',
        headline: `Stop overpaying for average quality. 🛑`,
        subheadline: `Get 100% Paisa-Vasool quality with ${product}`,
        label: 'Value Anchor',
        hookText: `Stop overpaying for average quality. 🛑`,
        onScreenDurationSec: 3,
      },
    ],
    primaryText: [
      `Tired of brands that look good in ads but disappoint on delivery?`,
      ``,
      `Here is what ${firstName} (${city}) experienced:`,
      `"${reviewText}"`,
      ``,
      `Pay only when it arrives at your doorstep! 🚚💨`,
    ].join('\n'),
    headline: `Pay via Cash on Delivery | Try Risk-Free`,
    description: `5-Star Rated Quality • Fast Dispatch`,
    ctaButton: 'Get Offer',
    trustBadges: defaultBadges,
    customerAttribution: attribution,
    intentCategory: review.intentCategory,
    copy: {
      primaryText: `Tired of brands that look good in ads but disappoint on delivery?`,
      headline: `Pay via Cash on Delivery | Try Risk-Free`,
      description: `5-Star Rated Quality • Fast Dispatch`,
      callToAction: 'Get Offer',
      trustBadges: defaultBadges,
    },
    metricsEstimate: {
      estCtr: '2.10%',
      targetRoas: '3.6x',
    },
    createdAt: new Date().toISOString(),
  };

  return [variation1, variation2, variation3];
}

/**
 * Single ad generator for MetaAdGeneratorStudio UI
 */
export function generateMetaAdCreative(
  review: ParsedHighIntentReview,
  brandName: string = 'Our Brand'
): MetaAdCreative {
  const product = review.productTitle || 'this product';
  const customer = review.author || review.authorName || 'Verified Customer';
  const city = review.buyerCity && review.buyerCity !== 'India' 
    ? review.buyerCity 
    : (review.authorCity && review.authorCity !== 'India' ? review.authorCity : '');
  const citySuffix = city ? ` from ${city}` : '';
  const attribution = `${customer} • Verified Buyer${citySuffix}`;

  const hooks: MetaAdHook[] = [
    {
      angle: 'skepticism_buster',
      type: 'curiosity_negative',
      label: '⚠️ Curiosity / Stop Scrolling',
      headline: `Don't buy ${product} before watching this honest review ⚠️`,
      subheadline: `See what ${customer} found out:`,
      hookText: `Don't buy ${product} before watching this honest review ⚠️`,
      onScreenDurationSec: 3,
    },
    {
      angle: 'skepticism_buster',
      type: 'skeptic_to_believer',
      label: '🔥 Skeptic to Believer',
      headline: `I honestly thought Instagram brands were all hype... until this arrived 🤐`,
      subheadline: `Here is the real truth:`,
      hookText: `I honestly thought Instagram brands were all hype... until this arrived 🤐`,
      onScreenDurationSec: 3,
    },
    {
      angle: 'regional_social_proof',
      type: 'relatable_pov',
      label: '✨ Relatable POV',
      headline: `POV: You finally stopped wasting money on cheap alternatives 🔥`,
      subheadline: `Real customer review:`,
      hookText: `POV: You finally stopped wasting money on cheap alternatives 🔥`,
      onScreenDurationSec: 3,
    },
    {
      angle: 'value_anchor',
      type: 'social_proof_viral',
      label: '💬 Compliment Magnet',
      headline: `Why literally everyone in my DMs asked where I bought this 👀`,
      subheadline: `Customer feedback:`,
      hookText: `Why literally everyone in my DMs asked where I bought this 👀`,
      onScreenDurationSec: 3,
    },
  ];

  const keyPhrase = review.extractedKeyPhrase || 
    (review.extractedKeywords && review.extractedKeywords.length > 0 ? review.extractedKeywords.join(', ') : '') ||
    review.cleanedText?.slice(0, 48) || 'loved it';

  const defaultBadges = [
    review.isCodMentioned ? 'Cash on Delivery Available' : '100% Authentic Quality',
    '⚡ Express Shipping Across India',
    '🔄 7-Day Easy Exchange',
  ];

  const copy: MetaAdCopy = {
    primaryText: `"${keyPhrase}" — ${customer}${citySuffix}\n\nOver 10,000+ Indian shoppers upgraded to ${brandName}'s ${product}. Real results, premium quality, zero compromises.\n\n🚚 Cash on Delivery (COD) Available Pan-India\n⚡ Delivered in 3-5 Business Days\n🔄 7-Day Hassle-Free Exchange Policy`,
    headline: `"${keyPhrase.slice(0, 48)}..." ⭐⭐⭐⭐⭐`,
    description: `Rated 4.9/5 by 12,400+ Verified Buyers across India`,
    callToAction: 'Shop Now',
    trustBadges: defaultBadges,
  };

  const estCtr = review.mediaType === 'video' ? '2.84%' : '1.92%';
  const targetRoas = review.mediaType === 'video' ? '4.8x' : '3.4x';

  return {
    id: `ad_${review.id}_${Date.now()}`,
    reviewId: review.id,
    productTitle: product,
    productName: product,
    customerName: customer,
    customerCity: city,
    customerAttribution: attribution,
    format: '9:16',
    activeFormat: '9:16',
    formats: ['9:16', '1:1', '4:5'],
    templateStyle: 'whatsapp_chat_proof',
    hook: hooks[0],
    hooks,
    selectedHookIndex: 0,
    primaryText: copy.primaryText,
    headline: copy.headline,
    description: copy.description,
    ctaButton: 'Shop Now',
    trustBadges: defaultBadges,
    intentCategory: review.intentCategory,
    videoUrl: review.mediaType === 'video' ? review.mediaUrl : '/demo_meta_ad.mp4',
    imageUrl: review.mediaType === 'image' ? review.mediaUrl : undefined,
    copy,
    metricsEstimate: {
      estCtr,
      targetRoas,
    },
    createdAt: new Date().toISOString(),
  };
}
