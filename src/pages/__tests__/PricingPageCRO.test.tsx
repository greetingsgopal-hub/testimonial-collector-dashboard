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

describe('PricingPage CRO & Monetization Architecture', () => {
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

  it('1. Renders 3-column pricing grid with dynamic billing rhythm toggle without redundant 3-pill duplication', async () => {
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
    expect(annualToggle.textContent).toContain('Save 50%');

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

  it('2. Founding Member anchor card features glowing border, Most Popular badge, and Zero Recurring differentiator', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const foundingCard = container.querySelector('#plan-card-founding');
    expect(foundingCard).not.toBeNull();
    expect(foundingCard?.className).toContain('border-amber-400');
    expect(foundingCard?.textContent).toContain('Most Popular • Lifetime Pass');
    expect(foundingCard?.textContent).toContain('₹4,999');
    expect(foundingCard?.textContent).toContain('Zero recurring monthly charges');

    const ctaBtn = container.querySelector('#btn-checkout-founding');
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn?.textContent).toContain('Get Lifetime Access');
  });

  it('3. Features localized payment trust badges right next to the checkout CTA buttons on every tier', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const foundingCard = container.querySelector('#plan-card-founding');
    expect(foundingCard?.textContent).toContain('⚡ Instant Activation');
    expect(foundingCard?.textContent).toContain('UPI & RuPay');
    expect(foundingCard?.textContent).toContain('GST Invoice');

    const annualCard = container.querySelector('#plan-card-annual');
    expect(annualCard?.textContent).toContain('UPI & RuPay');

    const monthlyCard = container.querySelector('#plan-card-monthly');
    expect(monthlyCard?.textContent).toContain('UPI & RuPay');
  });

  it('4. Integrates Chrome Extension Pro into a dedicated Optional Power-ups & Add-ons sub-grid', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );
    });

    const addOnsSection = container.querySelector('#powerups-and-addons');
    expect(addOnsSection).not.toBeNull();
    expect(addOnsSection?.textContent).toContain('Optional Power-ups & Add-ons');
    expect(addOnsSection?.textContent).toContain('PandaPraise Chrome Extension Pro');
    expect(addOnsSection?.textContent).toContain('₹100');
    expect(addOnsSection?.textContent).toContain('7-Day Free Trial');
    expect(addOnsSection?.textContent).toContain('WhatsApp Web Clipper');

    const trialBtn = container.querySelector('#btn-checkout-extension') as HTMLButtonElement;
    expect(trialBtn).not.toBeNull();
    expect(trialBtn.textContent).toContain('Start 7-Day Free Trial');
  });
});
