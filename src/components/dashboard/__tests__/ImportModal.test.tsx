import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ImportModal, PLATFORM_REGISTRY } from '../ImportModal';

// Mock firebase
vi.mock('../../../lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({
    currentUser: null,
  })),
}));

// Mock socialClient
const mockInitOAuth = vi.fn().mockResolvedValue({ success: true, authUrl: 'https://oauth.example.com' });
vi.mock('../../../lib/socialClient', () => ({
  socialClient: {
    initOAuth: (...args: any[]) => mockInitOAuth(...args),
  },
}));

describe('ImportModal - Unified Modal Architecture & Component Design', () => {
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

  it('1. Dynamically renders platform logo, title, and contextual placeholder for Facebook, Twitter/X, G2, etc.', async () => {
    // Test Twitter/X
    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="twitter"
        />
      );
    });

    const titleEl = container.querySelector('#import-modal-title');
    expect(titleEl?.textContent).toContain('Import from Twitter / X');

    const input = container.querySelector('#import-url-input') as HTMLInputElement;
    expect(input?.placeholder).toBe(PLATFORM_REGISTRY.twitter.placeholder);
    expect(input?.placeholder).toContain('https://x.com/username/status/');

    // Switch to G2
    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="g2"
        />
      );
    });

    expect(container.querySelector('#import-modal-title')?.textContent).toContain('Import from G2');
    const g2Input = container.querySelector('#import-url-input') as HTMLInputElement;
    expect(g2Input?.placeholder).toContain('https://www.g2.com/products/');
  });

  it('2. Features sleek Zero-Auth badge and removes redundant subtext from underneath the input box', async () => {
    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="facebook"
        />
      );
    });

    const badge = container.querySelector('#zero-auth-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('⚡ Instant Zero-Auth Link Scraper');

    // Make sure repetitive "Zero authentication barriers. We extract verified..." text is gone
    expect(container.textContent).not.toContain('Zero authentication barriers. We extract verified');
  });

  it('3. Standardizes primary action button "Fetch Reviews 🚀" and secondary navigation "Back"', async () => {
    const onBack = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={onClose}
          onBack={onBack}
          platformId="linkedin"
        />
      );
    });

    const fetchBtn = container.querySelector('#fetch-reviews-btn');
    expect(fetchBtn).not.toBeNull();
    expect(fetchBtn?.textContent).toContain('Fetch Reviews 🚀');

    const backBtn = container.querySelector('#modal-back-btn') as HTMLButtonElement;
    expect(backBtn).not.toBeNull();
    expect(backBtn?.textContent).toContain('Back');

    await act(async () => {
      backBtn.click();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('4. Provides instant inline validation when submitted with empty URL', async () => {
    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="reddit"
        />
      );
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    const errorBanner = container.querySelector('#import-modal-error');
    expect(errorBanner).not.toBeNull();
    expect(errorBanner?.textContent).toContain('Please enter a valid review page or public profile link.');
  });

  it('5. Switches to "Scraping reviews..." spinner state while fetching', async () => {
    // Mock global fetch with a delay
    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    globalThis.fetch = vi.fn().mockImplementation(() => fetchPromise) as any;

    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="yelp"
        />
      );
    });

    const input = container.querySelector('#import-url-input') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(input, 'https://www.yelp.com/biz/sample');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    const fetchBtn = container.querySelector('#fetch-reviews-btn');
    expect(fetchBtn?.textContent).toContain('Scraping reviews...');

    // Resolve fetch
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({
          success: true,
          reviews: [{ id: '1', authorName: 'Alice', text: 'Great service!', rating: 5 }],
        }),
      });
    });

    // Should now be on preview step
    expect(container.textContent).toContain('1 of 1 selected');
    expect(container.textContent).toContain('Alice');
  });

  it('6. Expands collapsible Advanced Connection Options accordion and triggers OAuth', async () => {
    await act(async () => {
      root.render(
        <ImportModal
          isOpen={true}
          onClose={vi.fn()}
          platformId="facebook"
        />
      );
    });

    const toggleBtn = container.querySelector('#toggle-advanced-options-btn') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();

    // Initially collapsed
    expect(container.querySelector('#advanced-options-content')).toBeNull();

    // Click to expand
    await act(async () => {
      toggleBtn.click();
    });

    const advancedContent = container.querySelector('#advanced-options-content');
    expect(advancedContent).not.toBeNull();
    expect(advancedContent?.textContent).toContain('Official Meta OAuth Sync');
    expect(advancedContent?.textContent).toContain('Real-time Webhook');

    const metaOAuthBtn = container.querySelector('#meta-oauth-btn') as HTMLButtonElement;
    expect(metaOAuthBtn).not.toBeNull();

    await act(async () => {
      metaOAuthBtn.click();
    });

    expect(mockInitOAuth).toHaveBeenCalledWith('facebook');
  });
});
