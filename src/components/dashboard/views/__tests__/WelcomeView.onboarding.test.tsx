import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WelcomeView } from '../WelcomeView';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_1', name: 'Acme SaaS', slug: 'acme' },
    collectionForm: { publicSlug: 'acme' },
  }),
}));

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_1', name: 'Acme SaaS', slug: 'acme' },
    collectionForm: { publicSlug: 'acme' },
  }),
}));

describe('WelcomeView Onboarding Upgrades', () => {
  let container: HTMLDivElement;
  let root: Root;

  const defaultProps = {
    onOpenForm: vi.fn(),
    onCollect: vi.fn(),
    onImport: vi.fn(),
    onProof: vi.fn(),
    onOpenWall: vi.fn(),
    onRichSnippet: vi.fn(),
    onWidgets: vi.fn(),
    reviews: [
      { id: 's1', status: 'approved', rating: 5, isSample: true },
      { id: 's2', status: 'approved', rating: 5, isSample: true },
      { id: 's3', status: 'approved', rating: 5, isSample: true },
    ],
    publishComplete: false,
    isViewingSampleData: true,
    onClearSampleData: vi.fn(),
  };

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

  it('1. Elevates Google & Meta importer with two co-primary action buttons in Step 1', async () => {
    await act(async () => {
      root.render(<WelcomeView {...defaultProps} />);
    });

    const previewBtn = container.querySelector('[data-testid="preview-review-form-btn"]') as HTMLButtonElement;
    const importBtn = container.querySelector('[data-testid="import-reviews-btn"]') as HTMLButtonElement;

    expect(previewBtn).not.toBeNull();
    expect(importBtn).not.toBeNull();

    // Check that import button triggers onImport
    act(() => {
      importBtn.click();
    });
    expect(defaultProps.onImport).toHaveBeenCalledTimes(1);

    // Check that preview button triggers onOpenForm
    act(() => {
      previewBtn.click();
    });
    expect(defaultProps.onOpenForm).toHaveBeenCalledTimes(1);
  });

  it('2. Makes all 3 wizard cards interactive and triggers corresponding routes', async () => {
    await act(async () => {
      root.render(<WelcomeView {...defaultProps} />);
    });

    const step1Card = container.querySelector('[data-testid="wizard-step-1"]') as HTMLElement;
    const step2Card = container.querySelector('[data-testid="wizard-step-2"]') as HTMLElement;
    const step3Card = container.querySelector('[data-testid="wizard-step-3"]') as HTMLElement;

    expect(step1Card).not.toBeNull();
    expect(step2Card).not.toBeNull();
    expect(step3Card).not.toBeNull();

    act(() => {
      step1Card.click();
    });
    expect(defaultProps.onCollect).toHaveBeenCalled();

    act(() => {
      step2Card.click();
    });
    expect(defaultProps.onProof).toHaveBeenCalled();

    act(() => {
      step3Card.click();
    });
    expect(defaultProps.onWidgets).toHaveBeenCalled();
  });

  it('3. Renders sample data banner with Clear Sample Data action when isViewingSampleData is true', async () => {
    await act(async () => {
      root.render(<WelcomeView {...defaultProps} isViewingSampleData={true} />);
    });

    expect(container.textContent).toContain('You are viewing sample reviews');
    const buttons = Array.from(container.querySelectorAll('button'));
    const clearBtn = buttons.find((b) => /clear sample data/i.test(b.textContent || ''));
    expect(clearBtn).toBeDefined();

    act(() => {
      clearBtn?.click();
    });
    expect(defaultProps.onClearSampleData).toHaveBeenCalledTimes(1);
  });

  it('4. Renders interactive gamified progress header with micro-checklist', async () => {
    await act(async () => {
      root.render(<WelcomeView {...defaultProps} />);
    });

    const checklistHeader = container.querySelector('[data-testid="onboarding-checklist-header"]');
    expect(checklistHeader).not.toBeNull();

    expect(container.textContent).toMatch(/curate & style collection/i);
    expect(container.textContent).toMatch(/preview review form or share link|step 1/i);
    expect(container.textContent).toMatch(/preview live widgets|wall of love/i);
  });
});
