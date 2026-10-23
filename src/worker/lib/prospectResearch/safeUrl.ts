/**
 * SSRF guard for user-supplied URLs fetched by the internal prospect research tool.
 *
 * Only plain public https URLs on the default port are allowed. IP literals,
 * loopback/private-style hostnames, credentials and non-default ports are rejected.
 * This is a hostname-level guard (Workers cannot resolve DNS before fetch); it is
 * paired with manual redirect re-validation in the fetcher.
 */

const MAX_URL_LENGTH = 300;

const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.intranet', '.corp'];

const IPV4_LITERAL = /^\d{1,3}(\.\d{1,3}){3}$/;

export function parseSafePublicHttpsUrl(raw: string): URL | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port !== '') return null;

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host) return null;
  // IPv6 literals are bracketed by the URL parser; reject all of them.
  if (host.startsWith('[') || host.includes(':')) return null;
  // The WHATWG parser canonicalises decimal/hex/octal IPv4 forms to dotted quads.
  if (IPV4_LITERAL.test(host)) return null;
  if (host === 'localhost') return null;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return null;
  // Single-label hosts (e.g. "intranet") are never public websites.
  if (!host.includes('.')) return null;

  return url;
}
