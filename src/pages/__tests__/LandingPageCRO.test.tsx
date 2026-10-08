import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    project: null,
    workspace: null,
    signOut: vi.fn(),
  }),
}));

// Mock SEO
vi.mock('../../lib/seo', () => ({
  usePageSeo: vi.fn(),
}));

// Mock Analytics
vi.mock('../../lib/analytics', () => ({
  analytics: {
    signupStarted: vi.fn(),
    ctaClicked: vi.fn(),
  },
}));

describe('LandingPage CRO & Structural Optimizations', () => {
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

  it('1. Alternates background styling across the 4 core feature sections to create visual rhythm', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    const collectSection = container.querySelector('#collect-section');
    expect(collectSection).not.toBeNull();
    expect(collectSection?.className).toContain('from-white');

    const findSection = container.querySelector('#find-section');
    expect(findSection).not.toBeNull();
    expect(findSection?.className).toContain('from-slate-50');

    const shareSection = container.querySelector('#share-section');
    expect(shareSection).not.toBeNull();
    expect(shareSection?.className).toContain('bg-white');

    const delightSection = container.querySelector('#delight-section');
    expect(delightSection).not.toBeNull();
    expect(delightSection?.className).toContain('from-purple-50');
  });

  it('2. Interactive widget format switcher renders and switches between Wall of Love, Ticker, Badge, and Card', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    // Initial state: Wall of Love is active
    const canvas = container.querySelector('#interactive-widget-preview-canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.textContent).toContain('★★★★★');

    // Switch to Marquee Ticker
    const tickerBtn = container.querySelector('#interactive-widget-tab-ticker') as HTMLButtonElement;
    expect(tickerBtn).not.toBeNull();

    await act(async () => {
      tickerBtn.click();
    });

    expect(canvas?.textContent).toContain('Live Testimonial Marquee');
    expect(canvas?.textContent).toContain('Infinite Carousel');

    // Switch to Rating Badge
    const badgeBtn = container.querySelector('#interactive-widget-tab-badge') as HTMLButtonElement;
    expect(badgeBtn).not.toBeNull();

    await act(async () => {
      badgeBtn.click();
    });

    expect(canvas?.textContent).toContain('4.9');
    expect(canvas?.textContent).toContain('1,280+ 5-Star Reviews');
    expect(canvas?.textContent).toContain('99.4% Customer Satisfaction');

    // Switch to Social Proof Card
    const cardBtn = container.querySelector('#interactive-widget-tab-card') as HTMLButtonElement;
    expect(cardBtn).not.toBeNull();

    await act(async () => {
      cardBtn.click();
    });

    expect(canvas?.textContent).toContain('Sarah Jenkins');
    expect(canvas?.textContent).toContain('GrowthStack');
  });

  it('3. Streamlined footer has deduplicated 4-column layout and prominent CTA banner', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    });

    const footer = container.querySelector('#landing-footer');
    expect(footer).not.toBeNull();

    // Headers
    const footerText = footer?.textContent || '';
    expect(footerText).toContain('Product');
    expect(footerText).toContain('Resources');
    expect(footerText).toContain('Integrations');
    expect(footerText).toContain('Account & Legal');

    // Prominent CTA button inside footer
    expect(footerText).toContain('Start for Free');

    // Copyright & legal
    expect(footerText).toContain('© 2026 Panda Praise Ltd. All rights reserved.');
    expect(footerText).toContain('Terms of Service');
    expect(footerText).toContain('Privacy Policy');

    // Deduplication check: Pricing appears exactly once in the footer links
    const pricingLinks = Array.from(footer?.querySelectorAll('a') || []).filter(
      (a) => a.textContent?.trim().includes('Pricing')
    );
    expect(pricingLinks.length).toBe(1);
  });

  it('4. SocialProofToast hides when hideWhenBlocked is true and supports dismissal', async () => {
    const { SocialProofToast } = await import('../../components/widgets/SocialProofToast');
    const mockReviews = [
      {
        id: 'r_1',
        name: 'Jordan Lee',
        role: 'CTO',
        company: 'CloudFlow',
        content: 'Remarkable testimonial tool that doubled our conversions.',
        rating: 5,
        status: 'approved' as const,
        type: 'text' as const,
        createdAt: new Date().toISOString(),
      },
    ];

    // Render with hideWhenBlocked = true
    await act(async () => {
      root.render(
        <SocialProofToast
          reviews={mockReviews}
          hideWhenBlocked={true}
        />
      );
    });

    expect(container.querySelector('#social-proof-toast')).toBeNull();

    // Render with hideWhenBlocked = false and trigger timers
    vi.useFakeTimers();
    sessionStorage.clear();

    await act(async () => {
      root.render(
        <SocialProofToast
          reviews={mockReviews}
          hideWhenBlocked={false}
        />
      );
    });

    // Advance 2s to trigger initial toast timer (1.8s)
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    const toast = container.querySelector('#social-proof-toast');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain('Jordan Lee');

    // Click dismiss button
    const dismissBtn = toast?.querySelector('button[title="Dismiss"]') as HTMLButtonElement;
    expect(dismissBtn).not.toBeNull();

    await act(async () => {
      dismissBtn.click();
    });

    expect(container.querySelector('#social-proof-toast')).toBeNull();
    expect(sessionStorage.getItem('panda_toast_dismissed')).toBe('true');

    vi.useRealTimers();
  });
});
