import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeUntrustedText,
  extractPageEvidence,
  fetchWebsiteEvidence,
  gatherEvidence,
} from './retrieve';
import type { ScrapedRawMention } from '../../handlers/radarHandler';

function htmlResponse(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    ...init,
  });
}

describe('sanitizeUntrustedText', () => {
  it('strips tags, control characters and collapses whitespace', () => {
    expect(sanitizeUntrustedText('<b>Hello</b>\u0000\n\n  <i>world</i>', 100)).toBe('Hello world');
  });

  it('decodes common entities', () => {
    expect(sanitizeUntrustedText('Tom &amp; Jerry &quot;Inc&quot;', 100)).toBe('Tom & Jerry "Inc"');
  });

  it('truncates to the max length with an ellipsis', () => {
    const out = sanitizeUntrustedText('a'.repeat(50), 10);
    expect(out.length).toBeLessThanOrEqual(10);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('extractPageEvidence', () => {
  it('extracts title, meta description and headings while ignoring scripts and styles', () => {
    const html = `<!doctype html><html><head>
      <title>Acme &amp; Co | Testimonials</title>
      <meta name="description" content="Acme collects reviews for SaaS teams.">
      <style>.x{color:red}</style>
      <script>var IGNORE_PREVIOUS_INSTRUCTIONS = 1;</script>
      </head><body><h1>Social proof that converts</h1><h2>Pricing from $29</h2></body></html>`;
    const ev = extractPageEvidence(html);
    expect(ev.title).toBe('Acme & Co | Testimonials');
    expect(ev.excerpt).toContain('Acme collects reviews for SaaS teams.');
    expect(ev.excerpt).toContain('Social proof that converts');
    expect(ev.excerpt).toContain('Pricing from $29');
    expect(ev.excerpt).not.toContain('IGNORE_PREVIOUS_INSTRUCTIONS');
    expect(ev.excerpt).not.toContain('color:red');
  });

  it('falls back to og:description when meta description is missing', () => {
    const ev = extractPageEvidence('<meta property="og:description" content="OG text"><title>T</title>');
    expect(ev.excerpt).toContain('OG text');
  });
});

describe('fetchWebsiteEvidence', () => {
  it('returns sanitised evidence for an html page', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(htmlResponse('<title>Acme</title><h1>Hi</h1>'));
    const ev = await fetchWebsiteEvidence('https://acme.com/', { fetchImpl });
    expect(ev).toMatchObject({ kind: 'website', url: 'https://acme.com/', title: 'Acme' });
    expect(fetchImpl).toHaveBeenCalledWith('https://acme.com/', expect.objectContaining({ redirect: 'manual' }));
  });

  it('returns null for non-html content types', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    expect(await fetchWebsiteEvidence('https://acme.com/', { fetchImpl })).toBeNull();
  });

  it('follows a redirect only when the target passes the SSRF guard', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { Location: 'https://www.acme.com/' } }))
      .mockResolvedValueOnce(htmlResponse('<title>Acme WWW</title>'));
    const ev = await fetchWebsiteEvidence('https://acme.com/', { fetchImpl });
    expect(ev?.url).toBe('https://www.acme.com/');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('refuses redirects to internal addresses', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: 'https://169.254.169.254/' } }));
    expect(await fetchWebsiteEvidence('https://acme.com/', { fetchImpl })).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('gives up after too many redirects', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 302, headers: { Location: 'https://acme.com/loop' } }));
    expect(await fetchWebsiteEvidence('https://acme.com/', { fetchImpl })).toBeNull();
    expect(fetchImpl.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it('refuses to fetch an unsafe initial URL', async () => {
    const fetchImpl = vi.fn();
    expect(await fetchWebsiteEvidence('https://localhost/', { fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('caps the number of body bytes read', async () => {
    const huge = '<title>Big</title>' + '<p>x</p>'.repeat(100_000);
    const fetchImpl = vi.fn().mockResolvedValue(htmlResponse(huge));
    const ev = await fetchWebsiteEvidence('https://acme.com/', { fetchImpl, maxBytes: 1024 });
    expect(ev?.title).toBe('Big');
  });

  it('returns null when the fetch throws (e.g. timeout/abort)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('aborted'));
    expect(await fetchWebsiteEvidence('https://acme.com/', { fetchImpl })).toBeNull();
  });
});

describe('gatherEvidence', () => {
  const mention = (id: string, url: string, text: string): ScrapedRawMention => ({
    externalId: id,
    source: 'HackerNews',
    targetKeyword: 'Acme',
    isCompetitor: false,
    author: 'someone',
    title: 'Title ' + id,
    rawText: text,
    sourceUrl: url,
  });

  it('assigns sequential source ids across website, HN and news evidence', async () => {
    const result = await gatherEvidence(
      { companyName: 'Acme', websiteUrl: 'https://acme.com/', mode: 'prospect' },
      {
        fetchWebsite: async () => ({
          kind: 'website', url: 'https://acme.com/', title: 'Acme', excerpt: 'Site text', retrievedAt: 'now',
        }),
        fetchHackerNews: async () => [mention('hn-1', 'https://news.ycombinator.com/item?id=1', 'HN text')],
        fetchNews: async () => [mention('g-1', 'https://news.example.com/a', 'News text')],
      }
    );
    expect(result.sources.map((s) => s.id)).toEqual(['S1', 'S2', 'S3']);
    expect(result.sources.map((s) => s.kind)).toEqual(['website', 'hackernews', 'news']);
    expect(result.sourceStatus).toEqual({ website: 'ok', hackernews: 'ok', news: 'ok' });
  });

  it('tolerates a failing source and reports it', async () => {
    const result = await gatherEvidence(
      { companyName: 'Acme', mode: 'prospect' },
      {
        fetchWebsite: async () => null,
        fetchHackerNews: async () => { throw new Error('boom'); },
        fetchNews: async () => [mention('g-1', 'https://news.example.com/a', 'News text')],
      }
    );
    expect(result.sources).toHaveLength(1);
    expect(result.sourceStatus).toEqual({ website: 'skipped', hackernews: 'failed', news: 'ok' });
  });

  it('drops non-https source URLs and caps items per feed', async () => {
    const many = Array.from({ length: 12 }, (_, i) => mention(`hn-${i}`, `https://hn.example.com/${i}`, `t${i}`));
    const result = await gatherEvidence(
      { companyName: 'Acme', mode: 'prospect' },
      {
        fetchWebsite: async () => null,
        fetchHackerNews: async () => [mention('bad', 'javascript:alert(1)', 'x'), ...many],
        fetchNews: async () => [],
      }
    );
    expect(result.sources.every((s) => s.url.startsWith('https://'))).toBe(true);
    expect(result.sources.filter((s) => s.kind === 'hackernews')).toHaveLength(5);
  });

  it('times out a slow source instead of hanging', async () => {
    const result = await gatherEvidence(
      { companyName: 'Acme', mode: 'prospect' },
      {
        fetchWebsite: async () => null,
        fetchHackerNews: () => new Promise(() => {}),
        fetchNews: async () => [],
        timeoutMs: 20,
      }
    );
    expect(result.sourceStatus.hackernews).toBe('failed');
  });
});
