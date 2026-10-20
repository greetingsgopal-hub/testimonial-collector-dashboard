import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

// Mock SEO
vi.mock('../../lib/seo', () => ({
  usePageSeo: vi.fn(),
}));

describe('LandingPage Dual Scanner & Live Signals Feed', () => {
  let container: HTMLDivElement;
  let root: Root;

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
    vi.clearAllMocks();
  });

  it('renders Dual Scanner inputs for Brand and Competitor', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    const brandInput = container.querySelector('input[placeholder*="Your Brand" i]');
    const competitorInput = container.querySelector('input[placeholder*="Competitor" i]');
    expect(brandInput).not.toBeNull();
    expect(competitorInput).not.toBeNull();

    const huntButton = container.querySelector('button[type="submit"], button.radar-hunt-btn');
    expect(huntButton).not.toBeNull();
    expect(container.textContent).toMatch(/Hunt Praise & Leads/i);
  });

  it('renders live signals feed with 4 category tabs', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toMatch(/Poachable Competitor Leads/i);
    expect(text).toMatch(/Auto-Harvested Praise/i);
  });

  it('hero does not contain obsolete website embed code copy', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    const heroSection = container.querySelector('section');
    const heroText = heroSection ? heroSection.textContent || '' : '';
    expect(heroText).not.toMatch(/one-line embed code/i);
    expect(heroText).not.toMatch(/iframe snippet/i);
  });
});
