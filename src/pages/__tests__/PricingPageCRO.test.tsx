import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { PricingPage } from '../PricingPage';

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

describe('PricingPage Architecture & Monetization', () => {
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

  it('1. Renders 3-column pricing grid with dynamic billing rhythm toggle', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const annualToggle = container.querySelector('#billing-toggle-annual') as HTMLButtonElement;
    const monthlyToggle = container.querySelector('#billing-toggle-monthly') as HTMLButtonElement;
    expect(annualToggle).not.toBeNull();
    expect(monthlyToggle).not.toBeNull();
    expect(annualToggle.textContent).toContain('Save 35%');

    // Switch to monthly billing
    await act(async () => {
      monthlyToggle.click();
    });
    expect(monthlyToggle.className).toContain('bg-white');

    // 3 plans rendered in grid
    const plansGrid = container.querySelector('#pricing-plans-grid');
    expect(plansGrid).not.toBeNull();
    expect(plansGrid?.children.length).toBe(3);
  });

  it('2. Pro plan card features Most Popular badge and upgrade CTA', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const proCard = container.querySelector('#plan-card-pro');
    expect(proCard).not.toBeNull();
    expect(proCard?.textContent).toContain('Most Popular • Best Value');
    expect(proCard?.textContent).toContain('Pro');

    const ctaBtn = container.querySelector('#btn-checkout-pro');
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn?.textContent).toContain('Upgrade to Pro');
  });

  it('3. VIP Founding Member Lifetime Pass banner renders with lifetime pricing', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const lifetimeCard = container.querySelector('#plan-card-lifetime');
    expect(lifetimeCard).not.toBeNull();
    expect(lifetimeCard?.textContent).toContain('Founding Member Lifetime Pass');
    expect(lifetimeCard?.textContent).toContain('One-Time Payment');
    expect(lifetimeCard?.textContent).toContain('₹14,999');

    const lifetimeBtn = container.querySelector('#btn-checkout-lifetime');
    expect(lifetimeBtn).not.toBeNull();
    expect(lifetimeBtn?.textContent).toContain('Claim Lifetime Pass');
  });

  it('4. Renders Comparison Table and FAQ sections', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const comparisonSection = container.querySelector('#comparison');
    expect(comparisonSection).not.toBeNull();
    expect(comparisonSection?.textContent).toContain('Compare plans side-by-side');

    const faqSection = container.querySelector('#faq');
    expect(faqSection).not.toBeNull();
    expect(faqSection?.textContent).toContain('Frequently Asked Questions');
  });

  it('5. Switches seamlessly between Indian Rupees (INR) and Worldwide USD pricing', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const usdToggle = container.querySelector('#currency-toggle-usd') as HTMLButtonElement;
    const inrToggle = container.querySelector('#currency-toggle-inr') as HTMLButtonElement;
    expect(usdToggle).not.toBeNull();
    expect(inrToggle).not.toBeNull();

    // Switch to USD
    await act(async () => {
      usdToggle.click();
    });

    const proCard = container.querySelector('#plan-card-pro');
    const agencyCard = container.querySelector('#plan-card-agency');
    const lifetimeCard = container.querySelector('#plan-card-lifetime');

    expect(proCard?.textContent).toContain('$19');
    expect(agencyCard?.textContent).toContain('$49');
    expect(lifetimeCard?.textContent).toContain('$199');

    // Switch back to INR
    await act(async () => {
      inrToggle.click();
    });
    expect(proCard?.textContent).toContain('₹999');
    expect(agencyCard?.textContent).toContain('₹2,499');
    expect(lifetimeCard?.textContent).toContain('₹14,999');
  });
});
