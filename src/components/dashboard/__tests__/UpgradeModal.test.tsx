import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { UpgradeModal } from '../UpgradeModal';

describe('UpgradeModal Component (Task 1.1)', () => {
  let container: HTMLDivElement;
  const mockOnClose = vi.fn();
  const mockOnSelectPlan = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    mockOnClose.mockClear();
    mockOnSelectPlan.mockClear();
  });

  const renderComponent = async (ui: React.ReactElement) => {
    const root = createRoot(container);
    await act(async () => {
      root.render(ui);
    });
    return { container, root };
  };

  it('renders upgrade options and feature matrix when open', async () => {
    await renderComponent(
      <UpgradeModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectPlan={mockOnSelectPlan}
      />
    );

    expect(container.textContent).toContain('Upgrade to PandaPraise Pro');
    expect(container.textContent).toContain('Unlimited Testimonials');
    expect(container.textContent).toContain('Remove Branding');
    expect(container.textContent).toContain('HD Video Collection');

    const upgradeBtn = container.querySelector('button[data-testid="upgrade-pro-btn"]');
    expect(upgradeBtn).not.toBeNull();

    await act(async () => {
      (upgradeBtn as HTMLButtonElement).click();
    });
    expect(mockOnSelectPlan).toHaveBeenCalledWith('pro');
  });

  it('does not render when isOpen is false', async () => {
    await renderComponent(
      <UpgradeModal
        isOpen={false}
        onClose={mockOnClose}
        onSelectPlan={mockOnSelectPlan}
      />
    );

    expect(container.children.length).toBe(0);
  });
});
