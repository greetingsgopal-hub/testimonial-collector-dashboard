import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ReviewToMetaAdsStudioPage } from '../ReviewToMetaAdsStudioPage';

describe('ReviewToMetaAdsStudioPage Integration Hub', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
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

  it('renders page header, edition tag, and default Review Ingestion tab', async () => {
    await act(async () => {
      root.render(<ReviewToMetaAdsStudioPage />);
    });

    expect(container.textContent).toContain('D2C India Edition');
    expect(container.textContent).toContain('Review-to-Meta-Ad Studio 🚀');
    expect(container.textContent).toContain('1. Shopify Connect');
    expect(container.textContent).toContain('2. Review Ingestion');
    expect(container.textContent).toContain('3. Meta Ad Generator');

    // Default tab is Review Ingestion
    expect(container.textContent).toContain('Paste Customer Reviews / WhatsApp Feedback');
    expect(container.textContent).toContain('Extract & Score Reviews');
  });

  it('switches to Shopify Connect tab when clicked', async () => {
    await act(async () => {
      root.render(<ReviewToMetaAdsStudioPage />);
    });

    const connectTab = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('1. Shopify Connect')
    );
    expect(connectTab).toBeTruthy();

    await act(async () => {
      connectTab?.click();
    });

    expect(container.textContent).toContain('Connect Your Shopify Store');
    expect(container.textContent).toContain('Connect Store & Sync Reviews');
  });

  it('switches to Meta Ad Generator tab when clicked', async () => {
    await act(async () => {
      root.render(<ReviewToMetaAdsStudioPage />);
    });

    const adsTab = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('3. Meta Ad Generator')
    );
    expect(adsTab).toBeTruthy();

    await act(async () => {
      adsTab?.click();
    });

    expect(container.textContent).toContain('Review-to-Meta-Ad Creative Generator');
    expect(container.textContent).toContain('⚡ Generate 3 Meta Ad Variations');
  });
});
