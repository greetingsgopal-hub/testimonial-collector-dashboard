import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { escapeHtml } from './security';

/**
 * HIGH-5 regression test — HTML escaping for the email signature embed.
 * User-submitted testimonial content must be escaped before interpolation
 * into the HTML string rendered with dangerouslySetInnerHTML.
 */

describe('escapeHtml', () => {
  it('escapes all HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands first to prevent double-escape bypasses', () => {
    expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("onerror='boom'")).toBe('onerror=&#39;boom&#39;');
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml('')).toBe('');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Great service, highly recommended!')).toBe('Great service, highly recommended!');
  });
});

describe('HIGH-5: EmailSignatureEmbed escapes user content in generated HTML', () => {
  it('imports and applies escapeHtml to testimonial content', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/EmailSignatureEmbed.tsx'),
      'utf8'
    );
    expect(source).toContain("import { escapeHtml } from '../../lib/security'");
    expect(source).toMatch(/escapeHtml\(truncateQuote\(topReview\.content/);
    expect(source).toMatch(/escapeHtml\(topReview\.name\)/);
    expect(source).toMatch(/escapeHtml\(topReview\.company\)/);
  });

  it('validates brandColor as a hex color before interpolation', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/EmailSignatureEmbed.tsx'),
      'utf8'
    );
    expect(source).toMatch(/safeColor/);
    expect(source).toMatch(/\^#\( \[0-9a-f\]\{3\}|\[0-9a-f\]\{6\}\)\$/i);
  });
});

describe('MEDIUM: QrCodeGenerator validates colors into SVG markup', () => {
  it('sanitizes fg/bg colors and data before building SVG', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/QrCodeGenerator.tsx'),
      'utf8'
    );
    expect(source).toMatch(/safeFg/);
    expect(source).toMatch(/safeBg/);
    expect(source).toMatch(/safeData/);
  });
});
