import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RichSnippetView } from '../RichSnippetView';
import { Review } from '../../../../types';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_100', name: 'Acme SaaS', websiteUrl: 'https://acme.io' },
    workspace: { id: 'ws_100', name: 'Acme Workspace' },
  }),
}));

describe('RichSnippetView - Google Search Star Generator', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('1. Displays friendly, value-first header and prominent Google SERP preview', async () => {
    await act(async () => {
      root.render(<RichSnippetView reviews={[]} />);
    });

    // Value-first header text
    expect(container.textContent).toContain('Google Search Star Generator');
    expect(container.textContent).toContain('One-Click Golden Stars');
    expect(container.textContent).toContain('60-Second Setup');

    // Prominent Google Search appearance card
    expect(container.textContent).toContain('Live Google Search Appearance');
    expect(container.textContent).toContain('Acme SaaS — Verified Reviews & Ratings');
    expect(container.textContent).toContain('acme.io');
    expect(container.textContent).toContain('Schema Validated');
    expect(container.textContent).toContain('Rating: 5.0');
  });

  it('2. Unified action dock: copies schema code and displays success status pill', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await act(async () => {
      root.render(<RichSnippetView reviews={[]} />);
    });

    // Find the Copy Google Schema Code button in the unified dock
    const copyBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Copy Google Schema Code')
    );
    expect(copyBtn).toBeDefined();

    await act(async () => {
      copyBtn!.click();
    });

    expect(writeTextMock).toHaveBeenCalled();
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('<script type="application/ld+json">');
    expect(copiedText).toContain('"name": "Acme SaaS"');
    expect(copiedText).toContain('"url": "https://acme.io"');

    // Verify success status pill appears
    expect(container.textContent).toContain(
      'Copied! Paste into your site header to activate search stars.'
    );
  });

  it('3. Unified action dock: Test with Google Rich Results button pre-fills user domain', async () => {
    await act(async () => {
      root.render(<RichSnippetView reviews={[]} />);
    });

    const testLink = Array.from(container.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Test with Google Rich Results')
    ) as HTMLAnchorElement | undefined;

    expect(testLink).toBeDefined();
    expect(testLink?.href).toBe(
      'https://search.google.com/test/rich-results?url=https%3A%2F%2Facme.io'
    );
    expect(testLink?.target).toBe('_blank');
  });

  it('4. Interactive platform guide switcher swaps instructions dynamically', async () => {
    await act(async () => {
      root.render(<RichSnippetView reviews={[]} />);
    });

    // Initial state: WordPress
    expect(container.textContent).toContain('WordPress Installation Instructions');
    expect(container.textContent).toContain('RankMath, Yoast SEO, or Header & Footer Scripts Plugin');

    // Switch to Shopify
    const shopifyBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Shopify'
    );
    expect(shopifyBtn).toBeDefined();

    await act(async () => {
      shopifyBtn!.click();
    });

    expect(container.textContent).toContain('Shopify Installation Instructions');
    expect(container.textContent).toContain('theme.liquid');

    // Switch to Webflow
    const webflowBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Webflow'
    );
    expect(webflowBtn).toBeDefined();

    await act(async () => {
      webflowBtn!.click();
    });

    expect(container.textContent).toContain('Webflow Installation Instructions');
    expect(container.textContent).toContain('Project Settings');

    // Switch to Framer
    const framerBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Framer'
    );
    expect(framerBtn).toBeDefined();

    await act(async () => {
      framerBtn!.click();
    });

    expect(container.textContent).toContain('Framer Installation Instructions');
    expect(container.textContent).toContain('Head Start');

    // Switch to HTML / Next.js
    const htmlBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'HTML / Next.js'
    );
    expect(htmlBtn).toBeDefined();

    await act(async () => {
      htmlBtn!.click();
    });

    expect(container.textContent).toContain('HTML / Next.js Installation Instructions');
    expect(container.textContent).toContain('app/layout.tsx');
  });

  it('5. Computes rating and review count from approved reviews', async () => {
    const reviews: Review[] = [
      {
        id: 'r1',
        projectId: 'proj_100',
        authorName: 'Client 1',
        name: 'Client 1',
        email: 'client1@test.com',
        rating: 5,
        content: 'Superb service!',
        status: 'approved',
        type: 'text',
        consent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r2',
        projectId: 'proj_100',
        authorName: 'Client 2',
        name: 'Client 2',
        email: 'client2@test.com',
        rating: 4,
        content: 'Great experience!',
        status: 'approved',
        type: 'text',
        consent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r3',
        projectId: 'proj_100',
        authorName: 'Pending Client',
        name: 'Pending Client',
        email: 'pending@test.com',
        rating: 1,
        content: 'Not approved yet',
        status: 'pending',
        type: 'text',
        consent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await act(async () => {
      root.render(<RichSnippetView reviews={reviews} />);
    });

    // (5 + 4) / 2 = 4.5
    expect(container.textContent).toContain('Rating: 4.5');
    expect(container.textContent).toContain('2 verified reviews');
  });
});
