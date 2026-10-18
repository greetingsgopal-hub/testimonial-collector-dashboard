// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AccountBillingView } from '../AccountBillingView';
import BillingAndPlansPage from '../../../../pages/BillingAndPlansPage';

describe('AccountBillingView & BillingAndPlansPage Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
  });

  it('1. Renders page header banner with Free Plan • Active and Upgrade to Pro CTA', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Account & Billing Management');
    expect(container.textContent).toContain('Free Plan • Active');
    expect(container.textContent).toContain('Manage your PandaPraise workspace subscription tier, usage quotas, payment methods, and GST invoices via Razorpay.');
    expect(container.textContent).toContain('Upgrade to Pro');
  });

  it('2. Renders 4 KPI cards with real quotas and clean Razorpay payment method state (No fake 4242)', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    // Card 1: Current Plan
    expect(container.textContent).toContain('Current Plan');
    expect(container.textContent).toContain('Free Plan');
    expect(container.textContent).toContain('$0 / month • Free Forever');

    // Card 2: Video & Audio Proofs
    expect(container.textContent).toContain('Video & Audio Proofs');
    expect(container.textContent).toContain('1 / 2 Used');
    expect(container.textContent).toContain('1 video proof remaining on Free Plan');

    // Card 3: Text Testimonials
    expect(container.textContent).toContain('Text Testimonials');
    expect(container.textContent).toContain('8 / 10 Used');
    expect(container.textContent).toContain('2 text proofs remaining on Free Plan');

    // Card 4: Payment Method (Clean Razorpay state)
    expect(container.textContent).toContain('Payment Method');
    expect(container.textContent).toContain('No Payment Method');
    expect(container.textContent).toContain('Add via Razorpay');
    expect(container.textContent).toContain('Secured by Razorpay (PCI-DSS L1)');
    expect(container.textContent).not.toContain('•••• 4242');
    expect(container.textContent).not.toContain('okaxis');
  });

  it('3. Renders left column with Included in Free Plan vs Unlock with PandaPraise Pro breakdown', async () => {
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
    expect(container.textContent).toContain('₹2,499 / mo');
    expect(container.textContent).toContain('Unlimited Text, Audio & Video Testimonials');
    expect(container.textContent).toContain('Remove "Powered by PandaPraise" Branding');
    expect(container.textContent).toContain('Automated Review Request Drips (Email & WhatsApp)');
    expect(container.textContent).toContain('Custom Subdomain & Domain Collection Forms');
    expect(container.textContent).toContain('AI Sentiment Analysis & Spam Shield');
    expect(container.textContent).toContain('Pay with Razorpay — ₹2,499/mo');
  });

  it('4. Renders Billing & Tax Details card and opens edit modal', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Billing & Tax Details');
    expect(container.textContent).toContain('Legal / Company Name');
    expect(container.textContent).toContain('Tax ID (GSTIN / VAT Number)');
    expect(container.textContent).toContain('Billing Email Address');
    expect(container.textContent).toContain('Receives Razorpay GST receipts');
    expect(container.textContent).toContain('Edit Billing Info');

    // Click Edit Billing Info
    const editBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Edit Billing Info')
    );
    expect(editBtn).toBeDefined();

    await act(async () => {
      editBtn?.click();
    });

    expect(container.textContent).toContain('Edit Billing & GST Details');
    expect(container.textContent).toContain('Save Changes');
  });

  it('5. Renders Invoices card with empty state on Free Plan (No fake sequential invoices)', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Invoices & Receipts');
    expect(container.textContent).toContain('No billing history yet');
    expect(container.textContent).toContain('Once you complete a payment via Razorpay, your verified GST tax invoice will appear here automatically.');
    expect(container.textContent).not.toContain('INV-2026-004');
    expect(container.textContent).toContain('Payments processed via Razorpay.');
  });

  it('6. Renders full standalone layout with sidebar when hideSidebar is false', async () => {
    await act(async () => {
      root.render(<BillingAndPlansPage hideSidebar={false} />);
    });

    // Check sidebar elements
    expect(container.textContent).toContain('PandaPraise');
    expect(container.textContent).toContain('Welcome Hub');
    expect(container.textContent).toContain('Collect or Import');
    expect(container.textContent).toContain('Customize');
    expect(container.textContent).toContain('Post on internet');
    expect(container.textContent).toContain('Campaigns');
    expect(container.textContent).toContain('Referrals');
    expect(container.textContent).toContain('Billing & Plans');
  });
});
