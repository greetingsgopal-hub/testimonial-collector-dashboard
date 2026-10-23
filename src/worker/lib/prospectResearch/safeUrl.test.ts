import { describe, it, expect } from 'vitest';
import { parseSafePublicHttpsUrl } from './safeUrl';

describe('parseSafePublicHttpsUrl (SSRF guard)', () => {
  it('accepts a normal public https URL', () => {
    const url = parseSafePublicHttpsUrl('https://www.example.com/pricing');
    expect(url?.hostname).toBe('www.example.com');
  });

  it.each([
    ['http scheme', 'http://example.com'],
    ['ftp scheme', 'ftp://example.com'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['file scheme', 'file:///etc/passwd'],
    ['localhost', 'https://localhost/'],
    ['localhost subdomain', 'https://api.localhost/'],
    ['IPv4 loopback', 'https://127.0.0.1/'],
    ['IPv4 private', 'https://10.0.0.5/'],
    ['IPv4 metadata', 'https://169.254.169.254/latest/meta-data'],
    ['decimal IPv4', 'https://2130706433/'],
    ['IPv6 loopback', 'https://[::1]/'],
    ['IPv6 mapped', 'https://[::ffff:127.0.0.1]/'],
    ['.internal TLD', 'https://db.internal/'],
    ['.local TLD', 'https://printer.local/'],
    ['single label host', 'https://intranet/'],
    ['credentials in URL', 'https://user:pass@example.com/'],
    ['non-default port', 'https://example.com:8443/'],
    ['garbage', 'not a url'],
    ['empty', ''],
  ])('rejects %s', (_label, raw) => {
    expect(parseSafePublicHttpsUrl(raw)).toBeNull();
  });

  it('rejects overly long URLs', () => {
    expect(parseSafePublicHttpsUrl('https://example.com/' + 'a'.repeat(400))).toBeNull();
  });
});
