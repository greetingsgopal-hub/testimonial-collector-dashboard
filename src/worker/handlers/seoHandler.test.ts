import { describe, it, expect } from 'vitest';
import {
  handleSitemapXml,
  handleRobotsTxt,
  handleSeoPagePreRender,
} from './seoHandler';

describe('Programmatic SEO Engine (Phase 2)', () => {
  it('generates valid /sitemap.xml containing all static, competitor, and use-case routes', async () => {
    const request = new Request('https://pandapraise.com/sitemap.xml');
    const response = await handleSitemapXml(request, {} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/xml');
    const text = await response.text();

    expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(text).toContain('https://pandapraise.com/pricing');
    expect(text).toContain('https://pandapraise.com/alternatives/senja');
    expect(text).toContain('https://pandapraise.com/alternatives/testimonial-to');
    expect(text).toContain('https://pandapraise.com/best-shopify-testimonial-tools');
    expect(text).toContain('https://pandapraise.com/best-saas-testimonial-tools');
    expect(text).toContain('</urlset>');
  });

  it('generates /robots.txt referencing sitemap.xml', async () => {
    const request = new Request('https://pandapraise.com/robots.txt');
    const response = await handleRobotsTxt(request, {} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    const text = await response.text();

    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /api/');
    expect(text).toContain('Disallow: /dashboard/');
    expect(text).toContain('Sitemap: https://pandapraise.com/sitemap.xml');
  });

  it('pre-renders /alternatives/:competitor page with JSON-LD Schema and comparison matrix', async () => {
    const request = new Request('https://pandapraise.com/alternatives/senja');
    const response = await handleSeoPagePreRender(request, {} as any);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(200);
    expect(response!.headers.get('Content-Type')).toContain('text/html');
    const html = await response!.text();

    expect(html).toContain('PandaPraise vs Senja');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"SoftwareApplication"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('Migration Guide');
    expect(html).toContain('Feature Comparison');
  });

  it('pre-renders /best-:useCase-testimonial-tools page with industry schema and recommendations', async () => {
    const request = new Request('https://pandapraise.com/best-shopify-testimonial-tools');
    const response = await handleSeoPagePreRender(request, {} as any);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(200);
    const html = await response!.text();

    expect(html).toContain('Best Testimonial Tool for Shopify');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('Get Started Free');
  });

  it('returns null for unmatched non-SEO routes to fall back to SPA assets', async () => {
    const request = new Request('https://pandapraise.com/random-page-123');
    const response = await handleSeoPagePreRender(request, {} as any);
    expect(response).toBeNull();
  });
});
