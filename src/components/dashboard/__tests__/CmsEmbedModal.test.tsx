import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { CmsEmbedModal } from '../CmsEmbedModal';

describe('CmsEmbedModal Component (Task 3.1)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders nothing when isOpen is false', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<CmsEmbedModal isOpen={false} onClose={vi.fn()} spaceSlug="demo" />);
    });

    expect(container.textContent).toBe('');
  });

  it('renders Shopify, WordPress, Webflow, and Framer tabs when isOpen is true', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<CmsEmbedModal isOpen={true} onClose={vi.fn()} spaceSlug="hypergrowth" />);
    });

    expect(container.textContent).toContain('Install Testimonial Widget');
    expect(container.textContent).toContain('Shopify');
    expect(container.textContent).toContain('WordPress');
    expect(container.textContent).toContain('Webflow');
    expect(container.textContent).toContain('Framer');
    expect(container.textContent).toContain('Zero CSS Bleed');
  });

  it('generates customized Shopify code snippet with the space slug', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<CmsEmbedModal isOpen={true} onClose={vi.fn()} spaceSlug="hypergrowth" />);
    });

    expect(container.textContent).toContain('data-space="hypergrowth"');
    expect(container.textContent).toContain('https://pandapraise.com/embed.js');
  });
});
