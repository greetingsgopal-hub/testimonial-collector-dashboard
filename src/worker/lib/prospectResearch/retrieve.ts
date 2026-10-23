import { parseSafePublicHttpsUrl } from './safeUrl';
import type { ScrapedRawMention } from '../../handlers/radarHandler';
import type { ResearchRequest } from './validate';

/**
 * Evidence retrieval for the internal prospect research tool.
 *
 * All third-party text gathered here is UNTRUSTED: it is stripped of tags and
 * control characters, truncated, and handed to the caller as inert data for a
 * JSON-encoded prompt block. Nothing in this module executes or parses remote
 * content beyond plain-text extraction.
 */

export type SourceKind = 'website' | 'hackernews' | 'news';
export type SourceStatus = 'ok' | 'skipped' | 'failed';

export interface WebsiteEvidence {
  kind: 'website';
  url: string;
  title: string;
  excerpt: string;
  retrievedAt: string;
}

export interface EvidenceSource {
  id: string;
  kind: SourceKind;
  url: string;
  title: string;
  text: string;
  retrievedAt: string;
}

export interface GatheredEvidence {
  sources: EvidenceSource[];
  sourceStatus: { website: SourceStatus; hackernews: SourceStatus; news: SourceStatus };
}

export interface GatherDeps {
  fetchWebsite: (url: string) => Promise<WebsiteEvidence | null>;
  fetchHackerNews: () => Promise<ScrapedRawMention[]>;
  fetchNews: () => Promise<ScrapedRawMention[]>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_ITEMS_PER_FEED = 5;
const DEFAULT_MAX_BYTES = 200 * 1024;
const MAX_REDIRECTS = 2;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Renders untrusted third-party text inert: strips tags, control characters
 * and entity encodings, collapses whitespace, and truncates with an ellipsis.
 */
export function sanitizeUntrustedText(text: string, maxLength: number): string {
  if (!text) return '';
  let cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(CONTROL_CHARS, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (maxLength > 0 && cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength - 1).trimEnd() + '…';
  }
  return cleaned;
}

export interface PageEvidence {
  title: string;
  excerpt: string;
}

function matchMetaContent(html: string, key: string, attr: 'name' | 'property' = 'name'): string | null {
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}\\s*=\\s*["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = html.match(re);
  if (!tag) return null;
  const content = tag[0].match(/content\s*=\s*["']([\s\S]*?)["']/i);
  return content ? content[1] : null;
}

/**
 * Extracts plain-text evidence from an HTML document: title, meta description
 * (with og:description fallback) and h1-h3 headings. Script and style blocks
 * are removed before extraction so their contents can never leak into prompts.
 */
export function extractPageEvidence(html: string): PageEvidence {
  let doc = html || '';
  doc = doc.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const titleMatch = doc.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? sanitizeUntrustedText(titleMatch[1], 300) : '';

  const description = matchMetaContent(doc, 'description') || matchMetaContent(doc, 'og:description', 'property');
  const headings = Array.from(doc.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map((m) => sanitizeUntrustedText(m[1], 300))
    .filter(Boolean);

  const excerpt = sanitizeUntrustedText([description, ...headings].filter(Boolean).join(' — '), 2000);
  return { title, excerpt };
}

export interface FetchWebsiteOptions {
  fetchImpl?: typeof fetch;
  maxBytes?: number;
}

async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    return (await response.text()).slice(0, maxBytes);
  }
  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder('utf-8');
  let received = 0;
  let out = '';
  try {
    while (received < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      out += decoder.decode(value, { stream: true });
    }
  } catch {
    /* truncated read is acceptable */
  }
  try {
    await reader.cancel();
  } catch {
    /* already closed */
  }
  out += decoder.decode();
  return out.slice(0, maxBytes);
}

/**
 * Fetches a website through the SSRF guard: https-only, default port, no IP
 * literals or internal hostnames, manual redirects that are re-validated
 * (at most 2 follows), text/html responses only, and a hard cap on the number
 * of body bytes read. Any failure returns null instead of throwing.
 */
export async function fetchWebsiteEvidence(rawUrl: string, options: FetchWebsiteOptions = {}): Promise<WebsiteEvidence | null> {
  const fetchImpl = options.fetchImpl || fetch;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  let current = parseSafePublicHttpsUrl(rawUrl);
  if (!current) return null;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    let response: Response;
    try {
      response = await fetchImpl(current.href, {
        redirect: 'manual',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; PandaPraiseBot/2.0; +https://pandapraise.com)',
        },
      });
    } catch {
      return null;
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (!location) return null;
      let next: URL | null = null;
      try {
        next = parseSafePublicHttpsUrl(new URL(location, current.href).href);
      } catch {
        next = null;
      }
      if (!next) return null;
      current = next;
      continue;
    }

    if (response.status !== 200) return null;
    const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return null;
    }

    const html = await readCapped(response, maxBytes);
    const page = extractPageEvidence(html);
    return {
      kind: 'website',
      url: current.href,
      title: page.title,
      excerpt: page.excerpt,
      retrievedAt: new Date().toISOString(),
    };
  }
  return null;
}

type Attempt<T> = { ok: true; value: T } | { ok: false };

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<Attempt<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Source timed out.')), timeoutMs);
      }),
    ]);
    return { ok: true, value };
  } catch {
    return { ok: false };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isHttpsMention(m: ScrapedRawMention): boolean {
  return typeof m.sourceUrl === 'string' && m.sourceUrl.startsWith('https://');
}

/**
 * Gathers evidence from the website (when provided) plus the Hacker News and
 * Google News feeds. Sources run concurrently but are numbered deterministically
 * (website first, then hackernews, then news). Each source is individually
 * timeout- and failure-tolerant; per-feed item counts and non-https URLs are
 * capped/dropped. The status of every source is reported to the caller.
 */
export async function gatherEvidence(input: ResearchRequest, deps: GatherDeps): Promise<GatheredEvidence> {
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const sourceStatus: GatheredEvidence['sourceStatus'] = { website: 'skipped', hackernews: 'failed', news: 'failed' };
  const sources: EvidenceSource[] = [];

  const websiteAttempt: Promise<Attempt<WebsiteEvidence | null>> = input.websiteUrl
    ? withTimeout(deps.fetchWebsite(input.websiteUrl), timeoutMs)
    : Promise.resolve({ ok: true, value: null } as Attempt<WebsiteEvidence | null>);
  const hnAttempt = withTimeout(deps.fetchHackerNews(), timeoutMs);
  const newsAttempt = withTimeout(deps.fetchNews(), timeoutMs);

  const [website, hackerNews, news] = await Promise.all([websiteAttempt, hnAttempt, newsAttempt]);

  let nextId = 1;
  const push = (kind: SourceKind, url: string, title: string, text: string, retrievedAt: string) => {
    sources.push({ id: `S${nextId++}`, kind, url, title, text, retrievedAt });
  };

  if (website.ok && website.value) {
    push('website', website.value.url, website.value.title, website.value.excerpt, website.value.retrievedAt);
    sourceStatus.website = 'ok';
  } else if (!website.ok) {
    sourceStatus.website = 'failed';
  }

  if (hackerNews.ok) {
    sourceStatus.hackernews = 'ok';
    for (const m of hackerNews.value.filter(isHttpsMention).slice(0, MAX_ITEMS_PER_FEED)) {
      push('hackernews', m.sourceUrl, sanitizeUntrustedText(m.title || m.externalId, 300), sanitizeUntrustedText(m.rawText, 1500), new Date().toISOString());
    }
  }

  if (news.ok) {
    sourceStatus.news = 'ok';
    for (const m of news.value.filter(isHttpsMention).slice(0, MAX_ITEMS_PER_FEED)) {
      push('news', m.sourceUrl, sanitizeUntrustedText(m.title || m.externalId, 300), sanitizeUntrustedText(m.rawText, 1500), new Date().toISOString());
    }
  }

  return { sources, sourceStatus };
}
