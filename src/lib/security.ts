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
