// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AccountBillingView } from '../AccountBillingView';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_billing_1', name: 'papasystem', slug: 'papasystem' },
    user: { uid: 'usr_owner_1', email: 'owner@papasystem.com', displayName: 'Gopal Thakur' },
    workspace: { id: 'ws_papasystem', name: 'papasystem Workspace', plan: 'free' },
  }),
}));

describe('AccountBillingView Suite - Conversion-First SaaS Architecture', () => {
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
  });

  it('1. Renders top header with Free Plan • Active badge and Upgrade to Pro ⚡ CTA (removes Stripe Connected)', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Account & Billing Management');
    expect(container.textContent).toContain('Free Plan • Active');
    expect(container.textContent).not.toContain('Stripe Connected');
    expect(container.textContent).toContain('Manage your PandaPraise workspace subscription tier, usage quotas, payment methods, and tax invoices.');
    expect(container.textContent).toContain('Upgrade to Pro ⚡');
  });

  it('2. Renders 4 conversion-driving KPI cards with real quotas and payment method state', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    // Card 1: CURRENT PLAN
    expect(container.textContent).toContain('CURRENT PLAN');
    expect(container.textContent).toContain('Free Plan');
    expect(container.textContent).toContain('$0 / month • Free Forever');
    expect(container.textContent).not.toContain('↑ Standard Monthly Renewal');

    // Card 2: VIDEO & AUDIO PROOFS
    expect(container.textContent).toContain('VIDEO & AUDIO PROOFS');
    expect(container.textContent).toContain('1 / 2 Used');
    expect(container.textContent).toContain('1 video proof remaining on Free Plan');

    // Card 3: TEXT TESTIMONIALS
    expect(container.textContent).toContain('TEXT TESTIMONIALS');
    expect(container.textContent).toContain('8 / 10 Used');
    expect(container.textContent).toContain('Upgrade for unlimited text & video proofs');

    // Card 4: PAYMENT METHOD (Empty state)
    expect(container.textContent).toContain('PAYMENT METHOD');
    expect(container.textContent).toContain('No Card on File');
    expect(container.textContent).toContain('+ Add Payment Method');
    expect(container.textContent).toContain('Secured by Stripe (PCI-DSS L1)');
    expect(container.textContent).not.toContain('Proof Limit');
  });

  it('3. Renders left column with Included in Free Plan vs Unlock with PandaPraise Pro tier breakdown', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    // Free tier included section
    expect(container.textContent).toContain('Included in Your Free Plan');
    expect(container.textContent).toContain('Free Forever');
    expect(container.textContent).toContain('Up to 10 Text & 2 Video Testimonials');
    expect(container.textContent).toContain('1 Standard Collection Form Link');
    expect(container.textContent).toContain('Basic Wall of Love Embed');
    expect(container.textContent).toContain('Bank-grade SSL & Cloudflare Edge Delivery');

    // Pro upsell section
    expect(container.textContent).toContain('Unlock with PandaPraise Pro');
    expect(container.textContent).toContain('$29 / mo');
    expect(container.textContent).toContain('Unlimited Text, Audio & Video Testimonials');
    expect(container.textContent).toContain('Remove "Powered by PandaPraise" Branding');
    expect(container.textContent).toContain('Automated Review Request Drips');
    expect(container.textContent).toContain('Custom Subdomain & Custom Domain');
    expect(container.textContent).toContain('AI Sentiment Analysis & Spam Moderation Shield');
    expect(container.textContent).toContain('1-Click Social Media Distribution Studio');
    expect(container.textContent).toContain('Inbound Webhooks & Developer REST API');
    expect(container.textContent).toContain('Upgrade to Pro — $29/mo →');
  });

  it('4. Renders Billing & Tax Details card with company name, email, tax ID and edit trigger', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Billing & Tax Details');
    expect(container.textContent).toContain('Legal / Company Name');
    expect(container.textContent).toContain('Billing Email');
    expect(container.textContent).toContain('Tax ID (GSTIN / VAT Number)');
    expect(container.textContent).toContain('Edit Billing Info');
  });

  it('5. Renders Invoices card with empty state on Free Plan and interactive demo toggle', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Invoices & Receipts');
    // On free plan without payments, must not show sequential $0.00 invoices
    expect(container.textContent).toContain('No billing history yet');
    expect(container.textContent).toContain('Paid invoices and downloadable tax receipts will appear here once you upgrade to a paid plan.');
    expect(container.textContent).not.toContain('$0.00 Paid');

    // Unclipped banner
    expect(container.textContent).toContain('Invoices are synced with Stripe. Need tax exemption or GST/VAT number? Update your Billing Info above.');

    // Toggle demo paid mode to preview real paid invoices
    const demoToggle = container.querySelector('#demo-toggle-invoices') as HTMLButtonElement;
    expect(demoToggle).not.toBeNull();
    expect(demoToggle.textContent).toContain('Preview Paid Invoices');

    await act(async () => {
      demoToggle.click();
    });

    expect(container.textContent).toContain('INV-2026-004');
    expect(container.textContent).toContain('$29.00');
    expect(container.textContent).toContain('Paid');
  });
});
