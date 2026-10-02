// src/worker/lib/universalExtractor.ts
import { WorkerEnv } from '../types';
import { fetchGooglePlaceDetailsNew } from './googleOAuth';

export interface ExtractedReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date?: string;
  platformUrl?: string;
  source: string;
}

export interface ExtractedEntity {
  name: string;
  url: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
}

export interface ResolvedImportPayload {
  success: boolean;
  platform: string;
  entity: ExtractedEntity;
  reviews: ExtractedReview[];
  error?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Detect the target platform from a given URL or text input.
 */
export function detectPlatform(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (
    trimmed.includes('google.com/maps') ||
    trimmed.includes('maps.google.') ||
    trimmed.includes('maps.app.goo.gl') ||
    trimmed.includes('goo.gl/maps') ||
    trimmed.includes('g.page/') ||
    trimmed.startsWith('chij')
  ) {
    return 'google';
  }
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.com') || trimmed.includes('fb.me')) {
    return 'facebook';
  }
  if (trimmed.includes('trustpilot.com')) {
    return 'trustpilot';
  }
  if (trimmed.includes('apps.apple.com') || trimmed.includes('itunes.apple.com')) {
    return 'appstore';
  }
  if (trimmed.includes('play.google.com')) {
    return 'playstore';
  }
  if (trimmed.includes('producthunt.com')) {
    return 'producthunt';
  }
  if (trimmed.includes('g2.com')) {
    return 'g2';
  }
  if (trimmed.includes('capterra.com')) {
    return 'capterra';
  }
  if (trimmed.includes('yelp.com')) {
    return 'yelp';
  }
  if (trimmed.includes('instagram.com')) {
    return 'instagram';
  }
  if (trimmed.includes('linkedin.com')) {
    return 'linkedin';
  }
  if (trimmed.includes('twitter.com') || trimmed.includes('x.com')) {
    return 'twitter';
  }
  return 'web';
}

/**
 * Extract OpenGraph and metadata tags from raw HTML string.
 */
function extractHtmlMeta(html: string): { title?: string; description?: string; image?: string; siteName?: string } {
  const getTag = (prop: string): string | undefined => {
    const regex = new RegExp(`<meta[^>]*property=["'](?:og:|twitter:)?${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    if (match && match[1]) return match[1].trim();

    const nameRegex = new RegExp(`<meta[^>]*name=["'](?:og:|twitter:)?${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
    const nameMatch = html.match(nameRegex);
    return nameMatch && nameMatch[1] ? nameMatch[1].trim() : undefined;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = getTag('title') || (titleMatch ? titleMatch[1].trim() : undefined);
  const description = getTag('description');
  const image = getTag('image');
  const siteName = getTag('site_name');

  return { title, description, image, siteName };
}

/**
 * Safely parse JSON-LD structured data scripts from HTML.
 */
function extractJsonLdBlocks(html: string): any[] {
  const blocks: any[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) {
          blocks.push(...parsed);
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed['@graph'])) {
            blocks.push(...parsed['@graph']);
          } else {
            blocks.push(parsed);
          }
        }
      } catch {
        // Skip unparseable JSON-LD blocks
      }
    }
  }
  return blocks;
}

/**
 * Extract reviews from Apple App Store public RSS JSON feed.
 */
async function extractAppStoreReviews(url: string): Promise<ResolvedImportPayload> {
  const match = url.match(/id(\d+)/i);
  if (!match || !match[1]) {
    throw new Error('Could not identify App Store ID. Please paste a valid App Store URL (e.g., https://apps.apple.com/app/id123456789).');
  }
  const appId = match[1];
  const feedUrl = `https://itunes.apple.com/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`;

  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch App Store reviews (HTTP ${res.status}).`);
  }

  const data: any = await res.json().catch(() => null);
  const entries: any[] = data?.feed?.entry || [];

  if (entries.length === 0) {
    return {
      success: true,
      platform: 'appstore',
      entity: {
        name: `App #${appId}`,
        url,
        reviewCount: 0,
      },
      reviews: [],
    };
  }

  // First entry is usually the app meta
  const appMeta = entries[0];
  const appName = appMeta?.['im:name']?.label || `App #${appId}`;
  const appIcon = Array.isArray(appMeta?.['im:image']) ? appMeta['im:image'][appMeta['im:image'].length - 1]?.label : undefined;

  const reviews: ExtractedReview[] = [];
  // Review entries start at index 1
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];
    const author = entry?.author?.name?.label || 'App Store User';
    const rating = parseInt(entry?.['im:rating']?.label || '5', 10);
    const title = entry?.title?.label || '';
    const body = entry?.content?.label || '';
    const text = title && body ? `${title}\n\n${body}` : (body || title);
    const date = entry?.updated?.label;
    const id = entry?.id?.label || `appstore_${appId}_${i}`;

    if (text) {
      reviews.push({
        id: `appstore_${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        authorName: author,
        rating: Math.max(1, Math.min(5, isNaN(rating) ? 5 : rating)),
        text,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        platformUrl: url,
        source: 'appstore',
      });
    }
  }

  return {
    success: true,
    platform: 'appstore',
    entity: {
      name: appName,
      url,
      avatar: appIcon,
      reviewCount: reviews.length,
    },
    reviews,
  };
}

/**
 * Extract reviews from Trustpilot public review page.
 */
async function extractTrustpilotReviews(inputUrl: string): Promise<ResolvedImportPayload> {
  let targetUrl = inputUrl.trim();
  if (!targetUrl.startsWith('http')) {
    targetUrl = `https://www.trustpilot.com/review/${targetUrl}`;
  } else if (!targetUrl.includes('/review/')) {
    const parsed = new URL(targetUrl);
    targetUrl = `https://www.trustpilot.com/review/${parsed.hostname.replace(/^www\./, '')}`;
  }

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Trustpilot returned status ${res.status}. Please check the domain or business name.`);
  }

  const html = await res.text();
  const meta = extractHtmlMeta(html);
  const jsonLdBlocks = extractJsonLdBlocks(html);

  let entityName = meta.title?.replace(/\s*Reviews\s*\|.*/i, '').trim() || 'Trustpilot Business';
  let rating: number | undefined;
  let reviewCount: number | undefined;
  const reviews: ExtractedReview[] = [];

  for (const block of jsonLdBlocks) {
    if (block?.aggregateRating) {
      const r = parseFloat(block.aggregateRating.ratingValue);
      if (!isNaN(r)) rating = r;
      const c = parseInt(block.aggregateRating.reviewCount, 10);
      if (!isNaN(c)) reviewCount = c;
    }
    if (block?.name && entityName === 'Trustpilot Business') {
      entityName = block.name;
    }

    const rawReviews = Array.isArray(block?.review) ? block.review : (block?.['@type'] === 'Review' ? [block] : []);
    for (const r of rawReviews) {
      const author = typeof r?.author === 'object' ? (r.author.name || 'Trustpilot Customer') : (r?.author || 'Trustpilot Customer');
      const rVal = parseFloat(r?.reviewRating?.ratingValue || '5');
      const body = r?.reviewBody || r?.description || '';
      const headline = r?.headline || '';
      const content = headline && body ? `${headline}\n\n${body}` : (body || headline);
      const date = r?.datePublished;
      const reviewId = `tp_${encodeURIComponent(author)}_${date || Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, '_');

      if (content) {
        reviews.push({
          id: reviewId,
          authorName: author,
          rating: Math.max(1, Math.min(5, isNaN(rVal) ? 5 : rVal)),
          text: content,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          platformUrl: targetUrl,
          source: 'trustpilot',
        });
      }
    }
  }

  // Fallback: If JSON-LD reviews weren't found, extract from next data or article reviews
  if (reviews.length === 0) {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextJson = JSON.parse(nextDataMatch[1]);
        const pageProps = nextJson?.props?.pageProps;
        if (pageProps?.businessUnit) {
          entityName = pageProps.businessUnit.displayName || entityName;
          rating = pageProps.businessUnit.trustScore || rating;
          reviewCount = pageProps.businessUnit.numberOfReviews || reviewCount;
        }
        const reviewsList = pageProps?.reviews || [];
        for (const item of reviewsList) {
          if (item?.text || item?.title) {
            reviews.push({
              id: `tp_${item.id || Date.now()}`,
              authorName: item.consumer?.displayName || 'Trustpilot Reviewer',
              authorAvatar: item.consumer?.image?.url,
              rating: item.rating || 5,
              text: item.title && item.text ? `${item.title}\n\n${item.text}` : (item.text || item.title),
              date: item.dates?.publishedDate || new Date().toISOString(),
              platformUrl: targetUrl,
              source: 'trustpilot',
            });
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
  }

  return {
    success: true,
    platform: 'trustpilot',
    entity: {
      name: entityName,
      url: targetUrl,
      avatar: meta.image || 'https://www.trustpilot.com/favicon.ico',
      rating,
      reviewCount: reviewCount ?? reviews.length,
    },
    reviews,
  };
}

/**
 * Extract public details and reviews from Facebook Page link.
 */
async function extractFacebookPage(inputUrl: string): Promise<ResolvedImportPayload> {
  let targetUrl = inputUrl.trim();
  if (!targetUrl.startsWith('http')) {
    targetUrl = `https://${targetUrl}`;
  }

  // Clean the URL to primary page or reviews tab
  const parsed = new URL(targetUrl);
  let pathname = parsed.pathname.replace(/\/+$/, '');
  const pageSlug = pathname.split('/').filter(Boolean)[0] || 'Facebook Page';

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const html = res.ok ? await res.text() : '';
  const meta = extractHtmlMeta(html);

  // Clean page name from OpenGraph
  let pageName = meta.title
    ? meta.title.replace(/\s*\|\s*Facebook.*/i, '').replace(/\s*-\s*Home.*/i, '').replace(/\s*Reviews.*/i, '').trim()
    : pageSlug;
  if (!pageName || pageName === 'Facebook') {
    pageName = pageSlug;
  }

  const reviews: ExtractedReview[] = [];
  const jsonLdBlocks = extractJsonLdBlocks(html);

  for (const block of jsonLdBlocks) {
    const raw = Array.isArray(block?.review) ? block.review : (block?.['@type'] === 'Review' ? [block] : []);
    for (const r of raw) {
      const author = typeof r?.author === 'object' ? (r.author.name || 'Facebook User') : (r?.author || 'Facebook User');
      const rating = parseFloat(r?.reviewRating?.ratingValue || '5');
      const text = r?.reviewBody || r?.description;
      if (text) {
        reviews.push({
          id: `fb_pub_${Date.now()}_${reviews.length}`,
          authorName: author,
          rating: isNaN(rating) ? 5 : rating,
          text,
          date: r?.datePublished || new Date().toISOString(),
          platformUrl: targetUrl,
          source: 'facebook',
        });
      }
    }
  }

  return {
    success: true,
    platform: 'facebook',
    entity: {
      name: pageName,
      url: targetUrl,
      avatar: meta.image || 'https://facebook.com/favicon.ico',
      reviewCount: reviews.length,
    },
    reviews,
  };
}

/**
 * Universal HTML / Schema.org review extractor for any web page (Product Hunt, G2, Capterra, Yelp, or custom site).
 */
async function extractGenericWebReviews(url: string, platformHint?: string): Promise<ResolvedImportPayload> {
  const targetUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load URL (HTTP ${res.status}). Please check that the URL is public and accessible.`);
  }

  const html = await res.text();
  const meta = extractHtmlMeta(html);
  const jsonLdBlocks = extractJsonLdBlocks(html);

  const platform = platformHint || detectPlatform(targetUrl);
  let entityName = meta.title || 'Public Testimonials';
  let rating: number | undefined;
  let reviewCount: number | undefined;
  const reviews: ExtractedReview[] = [];

  // 1. Check JSON-LD
  for (const block of jsonLdBlocks) {
    if (block?.aggregateRating) {
      const r = parseFloat(block.aggregateRating.ratingValue);
      if (!isNaN(r)) rating = r;
      const c = parseInt(block.aggregateRating.reviewCount, 10);
      if (!isNaN(c)) reviewCount = c;
    }
    if (block?.name && (entityName === 'Public Testimonials' || !entityName)) {
      entityName = block.name;
    }

    const raw = Array.isArray(block?.review) ? block.review : (block?.['@type'] === 'Review' ? [block] : []);
    for (const r of raw) {
      const author = typeof r?.author === 'object' ? (r.author.name || 'Verified Customer') : (r?.author || 'Verified Customer');
      const rVal = parseFloat(r?.reviewRating?.ratingValue || '5');
      const body = r?.reviewBody || r?.description || '';
      const headline = r?.headline || '';
      const text = headline && body ? `${headline}\n\n${body}` : (body || headline);
      const date = r?.datePublished;
      const id = `${platform}_${encodeURIComponent(author)}_${reviews.length}`.replace(/[^a-zA-Z0-9_-]/g, '_');

      if (text) {
        reviews.push({
          id,
          authorName: author,
          rating: Math.max(1, Math.min(5, isNaN(rVal) ? 5 : rVal)),
          text,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          platformUrl: targetUrl,
          source: platform,
        });
      }
    }
  }

  // 2. Microdata / Blockquote fallback for custom customer testimonial pages
  if (reviews.length === 0) {
    const blockquoteRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
    let bMatch;
    let idx = 0;
    while ((bMatch = blockquoteRegex.exec(html)) !== null && idx < 10) {
      const rawText = bMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawText.length > 20 && rawText.length < 800) {
        reviews.push({
          id: `web_quote_${Date.now()}_${idx}`,
          authorName: 'Verified Customer',
          rating: 5,
          text: rawText,
          date: new Date().toISOString(),
          platformUrl: targetUrl,
          source: platform,
        });
        idx++;
      }
    }
  }

  return {
    success: true,
    platform,
    entity: {
      name: entityName,
      url: targetUrl,
      avatar: meta.image,
      rating,
      reviewCount: reviewCount ?? reviews.length,
    },
    reviews,
  };
}

/**
 * Main public entry point: Resolves reviews and business entity from any URL
 * without requiring third-party OAuth authentication.
 */
export async function resolveReviewsFromPublicUrl(
  input: string,
  env: WorkerEnv
): Promise<ResolvedImportPayload> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Please enter a URL to import reviews.');
  }

  const detected = detectPlatform(trimmed);

  switch (detected) {
    case 'google': {
      if (env.GOOGLE_PLACES_API_KEY) {
        try {
          const place = await fetchGooglePlaceDetailsNew(trimmed, env);
          return {
            success: true,
            platform: 'google',
            entity: {
              name: place.name,
              url: place.googleMapsUri || trimmed,
              address: place.address,
              rating: place.rating,
              reviewCount: place.totalReviews,
            },
            reviews: (place.reviews || []).map((r) => ({
              id: r.id,
              authorName: r.authorName,
              authorAvatar: r.authorAvatar,
              rating: r.rating,
              text: r.text,
              date: r.date,
              platformUrl: r.platformUrl || trimmed,
              source: 'google',
            })),
          };
        } catch (err: any) {
          console.warn('[UniversalExtractor] Google Places API resolve failed, falling back to web extractor:', err.message);
        }
      }
      return await extractGenericWebReviews(trimmed, 'google');
    }

    case 'appstore':
      return await extractAppStoreReviews(trimmed);

    case 'trustpilot':
      return await extractTrustpilotReviews(trimmed);

    case 'facebook':
      return await extractFacebookPage(trimmed);

    case 'producthunt':
    case 'g2':
    case 'capterra':
    case 'yelp':
    case 'playstore':
    default:
      return await extractGenericWebReviews(trimmed, detected);
  }
}
