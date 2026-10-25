import { RawReview, ReviewSource, ReviewMediaType } from './types';

/**
 * Universal Review Parser for popular Shopify review platforms and WhatsApp UGC submissions.
 */
export function parseRawReviews(data: any[], source: ReviewSource = 'judge_me'): RawReview[] {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    const id = item.id ? String(item.id) : `rev_${Date.now()}_${index}`;
    let authorName = 'Verified Buyer';
    let authorCity: string | undefined = undefined;
    let rating = 5;
    let body = '';
    let title: string | undefined = undefined;
    let productTitle = 'Featured Product';
    let mediaType: ReviewMediaType = 'text';
    let mediaUrls: string[] = [];
    let verifiedBuyer = true;
    let createdAt = item.created_at || item.date || new Date().toISOString();

    switch (source) {
      case 'judge_me':
        authorName = item.reviewer_name || item.name || authorName;
        authorCity = item.reviewer_location || item.city || undefined;
        rating = Number(item.rating) || 5;
        title = item.title || undefined;
        body = item.body || item.review || '';
        productTitle = item.product_title || item.product_handle || productTitle;
        if (item.pictures && item.pictures.length > 0) {
          mediaType = 'image';
          mediaUrls = item.pictures.map((p: any) => p.url || p);
        }
        break;

      case 'loox':
        authorName = item.author || item.name || authorName;
        rating = Number(item.rating) || 5;
        body = item.text || item.review || '';
        productTitle = item.product_name || productTitle;
        if (item.video_url) {
          mediaType = 'video';
          mediaUrls = [item.video_url];
        } else if (item.img_url) {
          mediaType = 'image';
          mediaUrls = [item.img_url];
        }
        break;

      case 'whatsapp':
        authorName = item.customerName || item.author_name || authorName;
        authorCity = item.city || undefined;
        rating = Number(item.rating) || 5;
        body = item.messageText || item.content || item.body || '';
        productTitle = item.productTitle || item.product_name || productTitle;
        if (item.videoUrl || item.video_url) {
          mediaType = 'video';
          mediaUrls = [item.videoUrl || item.video_url];
        } else if (item.imageUrl || item.image_url) {
          mediaType = 'image';
          mediaUrls = [item.imageUrl || item.image_url];
        }
        break;

      default:
        authorName = item.authorName || item.author || item.name || authorName;
        rating = Number(item.rating) || 5;
        body = item.body || item.content || item.review || '';
        productTitle = item.productTitle || item.product || productTitle;
        if (item.videoUrl) {
          mediaType = 'video';
          mediaUrls = [item.videoUrl];
        } else if (item.imageUrl) {
          mediaType = 'image';
          mediaUrls = [item.imageUrl];
        }
        break;
    }

    return {
      id,
      source,
      authorName,
      authorCity,
      rating,
      title,
      body: body.trim(),
      mediaType,
      mediaUrls,
      productTitle,
      verifiedBuyer,
      createdAt,
    };
  });
}
