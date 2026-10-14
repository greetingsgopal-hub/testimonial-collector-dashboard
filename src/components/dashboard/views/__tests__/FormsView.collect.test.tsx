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

  it('1. Clean layout: does not render bulky placecards', async () => {
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

    // Verify removed placecards are gone
    expect(container.textContent).not.toContain('Your collection form is live!');
    expect(container.querySelector('[data-testid="preview-sample-submissions-btn"]')).toBeNull();
    expect(container.querySelector('[data-testid="form-customer-preview-snippet"]')).toBeNull();
    expect(container.querySelector('[data-testid="review-mode-controls"]')).toBeNull();
  });

  it('2. Groups Configure, QR Code, and Copy Share Link in a unified action toolbar', async () => {
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
    const copyLinkBtn = toolbar?.querySelector('[data-testid="toolbar-copy-link-btn"]');

    expect(configureBtn).not.toBeNull();
    expect(qrBtn).not.toBeNull();
    expect(copyLinkBtn).not.toBeNull();
    expect(copyLinkBtn?.textContent).toContain('Copy Share Link');

    // Test clicking copy link
    await act(async () => {
      (copyLinkBtn as HTMLButtonElement).click();
    });
    expect(copyLinkBtn?.textContent).toContain('Copied!');
  });

  it('5. Renders Collection Pulse metrics strip and Review Pipeline callout banner', async () => {
    const mockReviews = [
      {
        id: 'rev_1',
        name: 'Alex Rivera',
        rating: 5,
        status: 'approved' as const,
        type: 'text' as const,
        content: 'Remarkable tool!',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rev_2',
        name: 'Sarah Chen',
        rating: 4,
        status: 'pending' as const,
        type: 'text' as const,
        content: 'Loved the smooth onboarding.',
        createdAt: new Date().toISOString(),
      },
    ];

    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          reviews={mockReviews}
        />
      );
    });

    expect(container.textContent).toContain('Collection Pulse');
    expect(container.textContent).toContain('Total Collected');
    expect(container.textContent).toContain('Avg Rating');
    expect(container.textContent).toContain('Approved Proof');
    expect(container.textContent).toContain('Format Mode');

    // Review Pipeline Callout Banner
    expect(container.textContent).toContain('Submissions in Queue');
    const moderateBtn = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent?.includes('Moderate')
    );
    expect(moderateBtn).toBeDefined();

    await act(async () => {
      moderateBtn?.click();
    });
    expect(mockOnViewProof).toHaveBeenCalledTimes(1);
  });

  it('6. Does not render Distribution Channels or Styling & Branding sections', async () => {
    const mockNavigateCampaigns = vi.fn();
    const mockNavigateWidgets = vi.fn();

    await act(async () => {
      root.render(
        <FormsView
          onConfigureForm={mockOnConfigure}
          onViewProof={mockOnViewProof}
          onUpdateForm={mockOnUpdateForm}
          onNavigateToCampaigns={mockNavigateCampaigns}
          onNavigateToWidgets={mockNavigateWidgets}
          reviews={[]}
        />
      );
    });

    expect(container.textContent).not.toContain('Distribution Channels');
    expect(container.textContent).not.toContain('Custom Branded Link');
    expect(container.textContent).not.toContain('Email Campaign');
    expect(container.textContent).not.toContain('In-Person & Packaging QR');
    expect(container.textContent).not.toContain('Inline Web Pop-up');
    expect(container.textContent).not.toContain('Styling & Branding');
  });
});
