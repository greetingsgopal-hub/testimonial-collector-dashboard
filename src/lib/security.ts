import { ReviewInput } from '../types';

/**
 * Security utilities for input sanitization and URL validation.
 */

export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  // Strictly enforce http:// or https:// protocol to prevent javascript: or data: URIs
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Strips HTML tags and limits text length to prevent XSS and payload bloating.
 */
export function sanitizeText(input: string | undefined | null, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';
  // Strip HTML tags
  const stripped = input.replace(/<[^>]*>?/gm, '');
  // Remove ASCII control characters except newline and tab
  const cleaned = stripped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates customer testimonial form input before submission.
 */
export function validateReviewInput(data: ReviewInput): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (data.name.trim().length > 100) {
    return { valid: false, error: 'Name must be 100 characters or fewer.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email.trim())) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }
  if (data.email.trim().length > 150) {
    return { valid: false, error: 'Email must be 150 characters or fewer.' };
  }

  if (!data.role || typeof data.role !== 'string' || !data.role.trim()) {
    return { valid: false, error: 'Please specify your role or job title.' };
  }
  if (data.role.trim().length > 100) {
    return { valid: false, error: 'Role must be 100 characters or fewer.' };
  }

  if (data.company && data.company.trim().length > 100) {
    return { valid: false, error: 'Company must be 100 characters or fewer.' };
  }

  if (data.title && data.title.trim().length > 150) {
    return { valid: false, error: 'Headline must be 150 characters or fewer.' };
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 10) {
    return { valid: false, error: 'Please write a testimonial of at least 10 characters.' };
  }
  if (data.content.trim().length > 2500) {
    return { valid: false, error: 'Testimonial exceeds maximum permitted length of 2,500 characters.' };
  }

  const ratingNum = Number(data.rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5 stars.' };
  }

  if (!data.consent) {
    return { valid: false, error: 'Please check the permission box to allow featuring your review.' };
  }

  if (data.type === 'video' && data.videoUrl) {
    if (!isValidHttpUrl(data.videoUrl)) {
      return { valid: false, error: 'Video link must be a valid HTTP or HTTPS URL.' };
    }
  }

  return { valid: true };
}

/**
 * Deduplicates accidental doubled/repeated strings (e.g., "PhrasePhrase" or "Phrase Phrase").
 */
export function deduplicateRepeatedString(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';
  let s = str.trim();

  // 1. Check exact half repetition without spaces (e.g. "Share Your ExperienceShare Your Experience")
  const len = s.length;
  if (len >= 4 && len % 2 === 0) {
    const half1 = s.substring(0, len / 2);
    const half2 = s.substring(len / 2);
    if (half1.toLowerCase() === half2.toLowerCase()) {
      s = half1.trim();
    }
  }

  // 2. Check repeated words/phrases with space or punctuation: "Word Word" -> "Word"
  s = s.replace(/^(.{3,}?)\s+\1$/i, '$1').trim();
  s = s.replace(/^(.{3,}?)\1$/i, '$1').trim();

  return s;
}

/**
 * Cleans brand or product names by deduplicating and filtering out generic form prompts
 * like "Share Your Experience", "Rate your experience", or "Customer Testimonials".
 */
export function cleanBrandOrProductName(raw?: string | null): string {
  const deduped = deduplicateRepeatedString(raw);
  if (!deduped) return '';

  const lower = deduped.toLowerCase();

  // If it's a form instruction or generic fallback rather than a business/product name
  if (
    lower.startsWith('share your experience') ||
    lower.startsWith('rate your experience') ||
    lower.startsWith('submit your testimonial') ||
    lower === 'customer testimonials' ||
    lower === 'feedback' ||
    lower === 'demo product' ||
    lower === 'our product' ||
    lower === 'our service'
  ) {
    return '';
  }

  return deduped;
}
