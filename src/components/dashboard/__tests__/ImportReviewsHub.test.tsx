import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ImportReviewsHub } from '../ImportReviewsHub';

// Mock storage
vi.mock('../../../lib/storage', () => ({
  storage: {
    createReview: vi.fn().mockResolvedValue({
      id: 'rev_manual_1',
      name: 'Manuel',
      content: 'This was manually created review text.',
      rating: 5,
    }),
    bulkCreateReviews: vi.fn().mockResolvedValue([]),
  },
}));

describe('ImportReviewsHub Component', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

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
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders all import source tabs and cards', () => {
    act(() => {
      root.render(
        <ImportReviewsHub
          projectId="proj-123"
          ownerId="owner-abc"
          onViewProof={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain('Import & Collect Testimonials');
    expect(container.textContent).toContain('CSV Spreadsheet');
    expect(container.textContent).toContain('Manual Entry');
    expect(container.textContent).toContain('X / Twitter');
    expect(container.textContent).toContain('Google Business');
  });

  it('switches to Manual Entry view when clicking Manual tab', () => {
    act(() => {
      root.render(
        <ImportReviewsHub
          projectId="proj-123"
          ownerId="owner-abc"
          onViewProof={vi.fn()}
        />
      );
    });

    const manualTab = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Manual Entry')
    );
    expect(manualTab).toBeDefined();

    act(() => {
      manualTab?.click();
    });

    expect(container.textContent).toContain('Add Testimonial Manually');
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('switches to X / Twitter view with handle search placeholder', () => {
    act(() => {
      root.render(
        <ImportReviewsHub
          projectId="proj-123"
          ownerId="owner-abc"
          onViewProof={vi.fn()}
        />
      );
    });

    const xTab = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('X / Twitter')
    );
    expect(xTab).toBeDefined();

    act(() => {
      xTab?.click();
    });

    expect(container.textContent).toContain('Import from X (Twitter)');
  });
});
