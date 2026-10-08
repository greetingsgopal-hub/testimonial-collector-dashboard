import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FormsView } from '../FormsView';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_collect_1', name: 'Beta Flow', slug: 'beta-flow' },
    collectionForm: {
      id: 'form_1',
      publicSlug: 'beta-flow',
      title: 'Share your feedback with Beta Flow',
      isActive: true,
      allowVideo: false,
      settings: {
        brandName: 'Beta Flow',
        brandColor: '#6701e6',
        requireRating: true,
      },
    },
  }),
}));

describe('FormsView Collect Page Upgrades Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockOnConfigure = vi.fn();
  const mockOnViewProof = vi.fn();
  const mockOnUpdateForm = vi.fn();

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

  it('1. Renders actionable empty state banner and Preview Sample Submissions when reviews is empty', async () => {
    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          reviews={[]}
          stats={{
            total: 0,
            averageRating: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
            archivedCount: 0,
            featuredCount: 0,
            ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }}
        />
      );
    });

    // Check encouraging inline banner
    expect(container.textContent).toContain('Your collection form is live!');
    expect(container.textContent).toContain('Share your link or print your QR code to start gathering praise.');

    // Check Preview Sample Submissions button
    const previewBtn = container.querySelector('[data-testid="preview-sample-submissions-btn"]');
    expect(previewBtn).not.toBeNull();
    expect(previewBtn?.textContent).toContain('Preview Sample Submissions');

    await act(async () => {
      (previewBtn as HTMLButtonElement).click();
    });
    expect(mockOnViewProof).toHaveBeenCalledTimes(1);
  });

  it('2. Embeds collection form URL inside a dedicated "Your Collection Link" card with one-click copy and preview snippet', async () => {
    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          reviews={[]}
        />
      );
    });

    const linkCard = container.querySelector('[data-testid="collection-link-card"]');
    expect(linkCard).not.toBeNull();
    expect(linkCard?.textContent).toContain('/c/beta-flow');

    // Quick preview snippet
    const previewSnippet = container.querySelector('[data-testid="form-customer-preview-snippet"]');
    expect(previewSnippet).not.toBeNull();
    expect(previewSnippet?.textContent).toContain('Beta Flow');

    // Copy link button inside card
    const copyBtn = container.querySelector('[data-testid="copy-collection-link-btn"]');
    expect(copyBtn).not.toBeNull();
  });

  it('3. Provides interactive review mode quick-toggle controls', async () => {
    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          reviews={[]}
        />
      );
    });

    const modeToggle = container.querySelector('[data-testid="review-mode-controls"]');
    expect(modeToggle).not.toBeNull();

    const videoPill = container.querySelector('[data-testid="mode-toggle-video"]');
    expect(videoPill).not.toBeNull();

    await act(async () => {
      (videoPill as HTMLButtonElement).click();
    });
    expect(mockOnUpdateForm).toHaveBeenCalledWith(expect.objectContaining({ allowVideo: true }));
  });

  it('4. Groups Configure, QR Code, and Test Live Form in a unified action toolbar', async () => {
    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          reviews={[]}
        />
      );
    });

    const toolbar = container.querySelector('[data-testid="collection-action-toolbar"]');
    expect(toolbar).not.toBeNull();

    const configureBtn = toolbar?.querySelector('[data-testid="toolbar-configure-btn"]');
    const qrBtn = toolbar?.querySelector('[data-testid="toolbar-qr-btn"]');
    const testLiveBtn = toolbar?.querySelector('[data-testid="toolbar-test-live-btn"]');

    expect(configureBtn).not.toBeNull();
    expect(qrBtn).not.toBeNull();
    expect(testLiveBtn).not.toBeNull();
  });
});
