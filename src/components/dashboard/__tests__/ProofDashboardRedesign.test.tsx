import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ReviewPipelineHero } from '../ReviewPipelineHero';
import { MetricsCards } from '../MetricsCards';
import { ReviewFilters } from '../ReviewFilters';
import { ReviewCard } from '../ReviewCard';
import { Review, ReviewStats, ReviewFilters as FilterType } from '../../../types';

const mockReviews: Review[] = [
  {
    id: 'rev_1',
    name: 'Gopal Thakur',
    email: 'gopal@example.com',
    rating: 5,
    title: 'Immediate, measurable business impact',
    content: 'We saw immediate value within the first 48 hours of setup. The conversion increase was undeniable.',
    status: 'pending',
    tags: ['Quality', 'Recommended', 'Support'],
    createdAt: '2026-09-28T10:00:00Z',
    source: 'manual',
    isFeatured: false,
  },
  {
    id: 'rev_2',
    name: 'Sarah Connor',
    rating: 4,
    title: 'High trust and great UI',
    content: 'Very smooth experience collecting video reviews from enterprise clients.',
    status: 'approved',
    tags: ['SaaS'],
    createdAt: '2026-09-29T10:00:00Z',
    source: 'form',
    isFeatured: true,
  },
];

const mockStats: ReviewStats = {
  total: 2,
  approvedCount: 1,
  pendingCount: 1,
  rejectedCount: 0,
  archivedCount: 0,
  averageRating: 4.5,
  featuredCount: 1,
  videoCount: 0,
  textCount: 2,
  ratingBreakdown: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
};

describe('Proof Dashboard Redesign (Luminous Proof)', () => {
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
    document.body.innerHTML = '';
  });

  describe('ReviewPipelineHero Component', () => {
    it('renders hero title, moderation badge, sync pill, and sentiment ribbon', () => {
      const handleBatch = vi.fn();
      const handleInspect = vi.fn();

      act(() => {
        root.render(
          <ReviewPipelineHero
            stats={mockStats}
            reviews={mockReviews}
            projectName="Direct2Me"
            onBatchToggle={handleBatch}
            onInspectSentiment={handleInspect}
            onInviteCustomer={vi.fn()}
            onOpenSocialCard={vi.fn()}
            onConfigure={vi.fn()}
          />
        );
      });

      expect(container.textContent).toContain('Review Pipeline');
      expect(container.textContent).toContain('1 Awaiting Moderation');
      expect(container.textContent).toContain('Sync Active');
      expect(container.textContent).toContain('AI Sentiment 100% Positive');

      // Test batch click
      const batchBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Batch')
      );
      expect(batchBtn).toBeDefined();
      act(() => {
        batchBtn!.click();
      });
      expect(handleBatch).toHaveBeenCalledTimes(1);

      // Test inspect click
      const inspectBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Inspect')
      );
      expect(inspectBtn).toBeDefined();
      act(() => {
        inspectBtn!.click();
      });
      expect(handleInspect).toHaveBeenCalledTimes(1);
    });
  });

  describe('MetricsCards Component', () => {
    it('renders 4 horizontal metrics and interactive rating breakdown', () => {
      const handleFilterStatus = vi.fn();
      const handleFilterRating = vi.fn();

      act(() => {
        root.render(
          <MetricsCards
            stats={mockStats}
            onFilterByStatus={handleFilterStatus}
            onFilterByRating={handleFilterRating}
          />
        );
      });

      expect(container.textContent).toContain('Total Proof');
      expect(container.textContent).toContain('2 Verified');
      expect(container.textContent).toContain('Avg Rating');
      expect(container.textContent).toContain('Pending Queue');
      expect(container.textContent).toContain('1 Awaiting');
      expect(container.textContent).toContain('Direct Intake');
      expect(container.textContent).toContain('100% Direct');

      // Test clicking Total Proof card triggers onFilterByStatus('all')
      const totalProofCard = container.querySelector('div[class*="rounded-2xl"]') as HTMLDivElement;
      act(() => {
        totalProofCard.click();
      });
      expect(handleFilterStatus).toHaveBeenCalledWith('all');
    });
  });

  describe('ReviewFilters Component', () => {
    it('renders segmented capsule tabs and search input', () => {
      const initialFilters: FilterType = {
        status: 'all',
        rating: 'all',
        tag: 'all',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const setFilters = vi.fn();

      act(() => {
        root.render(
          <ReviewFilters
            filters={initialFilters}
            setFilters={setFilters}
            stats={mockStats}
            viewMode="grid"
            setViewMode={vi.fn()}
            onExportJSON={vi.fn()}
            onExportCSV={vi.fn()}
            onResetSeedData={vi.fn()}
            availableTags={['Quality', 'Support']}
          />
        );
      });

      expect(container.textContent).toContain('All');
      expect(container.textContent).toContain('Pending');
      expect(container.textContent).toContain('Approved');
      expect(container.textContent).toContain('Rejected');
      expect(container.textContent).toContain('Archived');

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      expect(searchInput).not.toBeNull();
      expect(searchInput.placeholder).toContain('Search keywords, customer name');
    });
  });

  describe('ReviewCard Component', () => {
    it('renders Luminous Proof card with meta row, tags, avatar, and 4 moderation buttons', () => {
      const handleStatus = vi.fn();
      const handleDelete = vi.fn();
      const handleSocial = vi.fn();

      act(() => {
        root.render(
          <ReviewCard
            review={mockReviews[0]}
            isSelected={false}
            onToggleSelect={vi.fn()}
            onUpdateStatus={handleStatus}
            onToggleFeatured={vi.fn()}
            onDelete={handleDelete}
            onOpenDetails={vi.fn()}
            onOpenSocialCard={handleSocial}
          />
        );
      });

      expect(container.textContent).toContain('Gopal Thakur');
      expect(container.textContent).toContain('Immediate, measurable business impact');
      expect(container.textContent).toContain('#Quality');
      expect(container.textContent).toContain('#Recommended');
      expect(container.textContent).toContain('#Support');
      expect(container.textContent).toContain('Social Card');

      // Test Approve button
      const approveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Approve')
      );
      expect(approveBtn).toBeDefined();
      act(() => {
        approveBtn!.click();
      });
      expect(handleStatus).toHaveBeenCalledWith('rev_1', 'approved');

      // Test Social Card button
      const socialBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Social Card')
      );
      expect(socialBtn).toBeDefined();
      act(() => {
        socialBtn!.click();
      });
      expect(handleSocial).toHaveBeenCalledWith(mockReviews[0]);
    });
  });
});
