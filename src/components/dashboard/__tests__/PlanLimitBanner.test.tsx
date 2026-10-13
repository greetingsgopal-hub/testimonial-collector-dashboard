import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { PlanLimitBanner } from '../PlanLimitBanner';
import { Workspace } from '../../../types';

describe('PlanLimitBanner (Task 1.1)', () => {
  let container: HTMLDivElement;
  const mockOnUpgrade = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    mockOnUpgrade.mockClear();
  });

  const renderComponent = async (ui: React.ReactElement) => {
    const root = createRoot(container);
    await act(async () => {
      root.render(ui);
    });
    return { container, root };
  };

  const freeWorkspace: Workspace = {
    id: 'ws-1',
    name: 'Growth Workspace',
    ownerId: 'user-1',
    plan: 'free',
    testimonialCount: 15,
    projectCount: 1,
    seatCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders limit reached banner when free plan has 15 testimonials', async () => {
    await renderComponent(
      <PlanLimitBanner
        workspace={freeWorkspace}
        testimonialCount={15}
        onUpgrade={mockOnUpgrade}
      />
    );

    expect(container.textContent).toContain('Free plan limit reached');
    expect(container.textContent).toContain('15 / 15');
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Upgrade to Pro');

    await act(async () => {
      btn!.click();
    });
    expect(mockOnUpgrade).toHaveBeenCalled();
  });

  it('renders warning banner when free plan is near limit (13/15 testimonials)', async () => {
    await renderComponent(
      <PlanLimitBanner
        workspace={freeWorkspace}
        testimonialCount={13}
        onUpgrade={mockOnUpgrade}
      />
    );

    expect(container.textContent).toContain('Approaching testimonial limit');
    expect(container.textContent).toContain('13 / 15');
  });

  it('does not render banner when on paid pro plan', async () => {
    const proWorkspace: Workspace = {
      ...freeWorkspace,
      plan: 'pro',
      testimonialCount: 50,
    };

    await renderComponent(
      <PlanLimitBanner
        workspace={proWorkspace}
        testimonialCount={50}
        onUpgrade={mockOnUpgrade}
      />
    );

    expect(container.children.length).toBe(0);
  });
});
