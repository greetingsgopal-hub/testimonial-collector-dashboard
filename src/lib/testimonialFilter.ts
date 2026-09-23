import { Review } from '../types';

export interface TestimonialFilterRules {
  // Mode: 'auto' (dynamic rule-based) | 'manual' (explicit ID selection)
  mode?: 'auto' | 'manual';
  manualReviewIds?: string[];

  // Rating: 0 = all ratings, 4 = 4+ stars, 5 = 5 stars only
  minRating?: number;

  // Tags
  tags?: string[];
  tagMatchMode?: 'any' | 'all';

  // Featured
  onlyFeatured?: boolean;

  // Type: 'all' | 'text' | 'image' | 'video'
  testimonialType?: 'all' | 'text' | 'image' | 'video';

  // Collection Form filter
  collectionFormId?: string;

  // Media flags
  requireAvatar?: boolean; // Has customer photo
  requireVideo?: boolean;  // Has video
  requireImage?: boolean;  // Has image or customer photo
}

/**
 * Filter approved testimonials according to Auto-Add rules or Manual selection.
 * Pure function: identical logic for Widget Studio preview, Public Widget, and Wall of Love.
 */
export function filterTestimonials(
  reviews: Review[],
  rules: TestimonialFilterRules,
  limit?: number
): Review[] {
  // Guard: only approved testimonials can be published publicly
  const approved = reviews.filter((r) => r.status === 'approved');

  // 1. Manual selection mode
  if (rules.mode === 'manual') {
    if (!rules.manualReviewIds || rules.manualReviewIds.length === 0) {
      return limit ? approved.slice(0, limit) : approved;
    }
    const idSet = new Set(rules.manualReviewIds);
    const selected = approved.filter((r) => idSet.has(r.id));
    return limit ? selected.slice(0, limit) : selected;
  }

  // 2. Dynamic Auto-Add rule evaluation
  const filtered = approved.filter((r) => {
    // Rating filter (0 = all, 4 = 4+, 5 = 5 only)
    if (rules.minRating && rules.minRating > 0) {
      if (r.rating < rules.minRating) return false;
    }

    // Featured only
    if (rules.onlyFeatured && !r.isFeatured) {
      return false;
    }

    // Tags & Tag match mode ('any' vs 'all')
    if (rules.tags && rules.tags.length > 0) {
      const reviewTags = (r.tags || []).map((t) => t.toLowerCase().trim());
      const targetTags = rules.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);

      if (targetTags.length > 0) {
        if (rules.tagMatchMode === 'all') {
          const matchesAll = targetTags.every((t) => reviewTags.includes(t));
          if (!matchesAll) return false;
        } else {
          // Default: 'any'
          const matchesAny = targetTags.some((t) => reviewTags.includes(t));
          if (!matchesAny) return false;
        }
      }
    }

    // Testimonial type filter
    if (rules.testimonialType && rules.testimonialType !== 'all') {
      if (rules.testimonialType === 'video') {
        const isVideo = r.type === 'video' || Boolean(r.videoUrl && r.videoUrl.trim().length > 0);
        if (!isVideo) return false;
      } else if (rules.testimonialType === 'image') {
        const hasPhoto = Boolean(r.avatarUrl && r.avatarUrl.trim().length > 0);
        if (!hasPhoto) return false;
      } else if (rules.testimonialType === 'text') {
        if (r.type === 'video') return false;
      }
    }

    // Collection form filter
    if (rules.collectionFormId && rules.collectionFormId !== 'all') {
      if (r.collectionFormId !== rules.collectionFormId) return false;
    }

    // Media requirements
    if (rules.requireAvatar) {
      const hasPhoto = Boolean(r.avatarUrl && r.avatarUrl.trim().length > 0);
      if (!hasPhoto) return false;
    }

    if (rules.requireVideo) {
      const hasVid = Boolean(r.type === 'video' || (r.videoUrl && r.videoUrl.trim().length > 0));
      if (!hasVid) return false;
    }

    if (rules.requireImage) {
      const hasImg = Boolean(r.avatarUrl && r.avatarUrl.trim().length > 0);
      if (!hasImg) return false;
    }

    return true;
  });

  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Serializes TestimonialFilterRules into URL query parameters for dynamic embed widgets & Wall of Love.
 */
export function serializeFilterRules(rules: TestimonialFilterRules): Record<string, string> {
  const params: Record<string, string> = {};

  if (rules.mode) params.mode = rules.mode;

  if (rules.mode === 'manual' && rules.manualReviewIds && rules.manualReviewIds.length > 0) {
    params.ids = rules.manualReviewIds.join(',');
    return params;
  }

  if (rules.minRating && rules.minRating > 0) {
    params.minRating = String(rules.minRating);
  }

  if (rules.tags && rules.tags.length > 0) {
    params.tags = rules.tags.join(',');
  }

  if (rules.tagMatchMode && rules.tagMatchMode !== 'any') {
    params.tagMatch = rules.tagMatchMode;
  }

  if (rules.onlyFeatured) {
    params.featured = '1';
  }

  if (rules.testimonialType && rules.testimonialType !== 'all') {
    params.type = rules.testimonialType;
  }

  if (rules.collectionFormId && rules.collectionFormId !== 'all') {
    params.formId = rules.collectionFormId;
  }

  if (rules.requireAvatar) params.hasPhoto = '1';
  if (rules.requireVideo) params.hasVideo = '1';
  if (rules.requireImage) params.hasImage = '1';

  return params;
}

/**
 * Parses URL query parameters into TestimonialFilterRules.
 */
export function parseFilterRulesFromParams(params: URLSearchParams): TestimonialFilterRules {
  const mode = params.get('mode') === 'manual' ? 'manual' : 'auto';
  const idsParam = params.get('ids');
  const manualReviewIds = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

  const minRating = Number(params.get('minRating')) || 0;
  
  // Backwards compatibility: supports both 'tags' (comma-separated) and legacy 'tag'
  const tagsParam = params.get('tags') || params.get('tag');
  const tags = tagsParam && tagsParam !== 'all'
    ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
    : undefined;

  const tagMatchMode = params.get('tagMatch') === 'all' ? 'all' : 'any';
  const onlyFeatured = params.get('featured') === '1';
  const testimonialType = (params.get('type') as any) || 'all';
  const collectionFormId = params.get('formId') || 'all';

  const requireAvatar = params.get('hasPhoto') === '1';
  const requireVideo = params.get('hasVideo') === '1';
  const requireImage = params.get('hasImage') === '1';

  return {
    mode,
    manualReviewIds,
    minRating,
    tags,
    tagMatchMode,
    onlyFeatured,
    testimonialType,
    collectionFormId,
    requireAvatar,
    requireVideo,
    requireImage,
  };
}
