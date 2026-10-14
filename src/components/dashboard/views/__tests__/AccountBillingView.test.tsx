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

describe('AccountBillingView Suite', () => {
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

  it('1. Renders Account & Billing Management hero, Stripe Connected pill, and upgrade CTA', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Account & Billing Management');
    expect(container.textContent).toContain('Stripe Connected');
    expect(container.textContent).toContain('Manage your PandaPraise workspace subscription tier');
    expect(container.textContent).toContain('Upgrade Plan');
  });

  it('2. Renders four metric cards and plan details', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Current Plan');
    expect(container.textContent).toContain('Free Plan');
    expect(container.textContent).toContain('Billing Cycle');
    expect(container.textContent).toContain('$0 / mo');
    expect(container.textContent).toContain('Proof Limit');
    expect(container.textContent).toContain('Unlimited');
    expect(container.textContent).toContain('Payment Security');
    expect(container.textContent).toContain('PCI-DSS L1');
  });

  it('3. Renders invoices, receipts, and workspace ownership details', async () => {
    await act(async () => {
      root.render(<AccountBillingView />);
    });

    expect(container.textContent).toContain('Invoices & Receipts');
    expect(container.textContent).toContain('INV-2026-004');
    expect(container.textContent).toContain('Workspace & Account Details');
    expect(container.textContent).toContain('Gopal Thakur');
    expect(container.textContent).toContain('owner@papasystem.com');
  });
});
