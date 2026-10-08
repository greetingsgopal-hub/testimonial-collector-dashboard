// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { MetricsCards } from '../../components/dashboard/MetricsCards';
import { SentimentDashboard } from '../../components/dashboard/SentimentDashboard';
import { ReviewCard } from '../../components/dashboard/ReviewCard';
import { ReviewTable } from '../../components/dashboard/ReviewTable';
import { Review, ReviewStats } from '../../types';

// Mock AuthContext
const mockUser = {
  id: 'usr_mod_1',
  uid: 'usr_mod_1',
  email: 'founder@example.com',
  displayName: 'Sarah Founder',
  emailVerified: true,
};

const mockProject = {
  id: 'proj_mod_1',
  name: 'SaaS Pulse',
  workspaceId: 'ws_mod_1',
  slug: 'saas-pulse',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockWorkspace = {
  id: 'ws_mod_1',
  name: 'SaaS Pulse Workspace',
  ownerId: 'usr_mod_1',
  plan: 'free',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    project: mockProject,
    projects: [mockProject],
    allProjects: [mockProject],
    workspace: mockWorkspace,
    activeProjectId: 'proj_mod_1',
    setActiveProjectId: vi.fn(),
    switchProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    createWorkspace: vi.fn(),
    switchWorkspace: vi.fn(),
    logout: vi.fn(),
    signOut: vi.fn(),
    sendVerificationEmail: vi.fn(),
    checkVerificationStatus: vi.fn().mockResolvedValue(true),
    isEmailVerified: true,
    isDemoMode: false,
    loading: false,
    isLoading: false,
    collectionForm: { id: 'form_1', publicSlug: 'saas-pulse', title: 'Collect Praise' },
  }),
}));

const mockPendingReviews: Review[] = [
  {
    id: 'rev_pending_1',
    projectId: 'proj_mod_1',
    name: 'Emily Watson',
    role: 'Product Lead',
    company: 'FinFlow',
    content: 'Panda Praise increased our customer conversion by 34% within two weeks. Absolutely stellar!',
    rating: 5,
    status: 'pending',
    type: 'text',
    source: 'form',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'rev_pending_2',
    projectId: 'proj_mod_1',
    name: 'Marcus Chen',
    role: 'Founder',
    company: 'DevScale',
    content: 'Incredible onboarding and easiest testimonial collection we have ever experienced.',
    rating: 5,
    status: 'pending',
    type: 'text',
    source: 'form',
    createdAt: '2026-03-02T12:00:00Z',
    updatedAt: '2026-03-02T12:00:00Z',
  },
];

const mockStatsWithPending: ReviewStats = {
  total: 2,
  averageRating: 5.0,
  approvedCount: 0,
  pendingCount: 2,
  rejectedCount: 0,
  archivedCount: 0,
  featuredCount: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 },
};

let storageReviewsMock: any[] = mockPendingReviews;
let storageStatsMock: any = mockStatsWithPending;

vi.mock('../../lib/storage', () => ({
  storage: {
    getReviews: vi.fn().mockImplementation(() => Promise.resolve(storageReviewsMock)),
    getStats: vi.fn().mockImplementation(() => Promise.resolve(storageStatsMock)),
    getCollectionForm: vi.fn().mockResolvedValue(null),
    updateReview: vi.fn().mockImplementation((id: string, updates: any) => {
      storageReviewsMock = storageReviewsMock.map(r => r.id === id ? { ...r, ...updates } : r);
      return Promise.resolve({});
    }),
    deleteReview: vi.fn().mockImplementation((id: string) => {
      storageReviewsMock = storageReviewsMock.filter(r => r.id !== id);
      return Promise.resolve({});
    }),
    getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
  },
  getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
}));

describe('Dashboard Moderation Queue & Customization Restructure Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    storageReviewsMock = [...mockPendingReviews];
    storageStatsMock = { ...mockStatsWithPending };
    localStorage.clear();
    localStorage.setItem('panda_praise_sample_cleared_proj_mod_1', 'true');
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

  it('1. Sidebar renames "Customize" to "Moderation Queue" matching page utility', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="proof"
            setActiveTab={vi.fn()}
            proofCount={2}
          />
        </MemoryRouter>
      );
    });

    // Should NOT have misleading "Customize" sidebar tab
    expect(container.textContent).not.toContain('Customize');
    // Should clearly show Moderation Queue
    expect(container.textContent).toContain('Moderation Queue');
  });

  it('2. MetricsCards gracefully displays pending broadcast status instead of broken 0%', () => {
    act(() => {
      root.render(
        <MetricsCards stats={mockStatsWithPending} />
      );
    });

    // Should indicate Awaiting Approval instead of broken 0% live broadcast rate
    expect(container.textContent).toContain('Live Broadcast Rate');
    expect(container.textContent).toContain('Awaiting Approval');
    expect(container.textContent).toContain('Ready to broadcast once approved');
    expect(container.textContent).toContain('2 pending');
  });

  it('3. SentimentDashboard analyzes pending submissions without showing broken 0%', () => {
    act(() => {
      root.render(
        <SentimentDashboard reviews={mockPendingReviews} />
      );
    });

    // Should analyze the incoming pending reviews with Pending Preview indicator
    expect(container.textContent).toContain('Pending Preview');
    expect(container.textContent).toContain('2 reviews analyzed');
    expect(container.textContent).not.toContain('0 reviews analyzed');
    expect(container.textContent).toMatch(/positive/i);
  });

  it('4. ReviewCard supports selection checkbox for fast bulk moderation and renders actions', () => {
    const handleToggle = vi.fn();
    const handleStatus = vi.fn();
    const handleDelete = vi.fn();

    act(() => {
      root.render(
        <ReviewCard
          review={mockPendingReviews[0]}
          isSelected={true}
          onToggleSelect={handleToggle}
          onUpdateStatus={handleStatus}
          onToggleFeatured={vi.fn()}
          onDelete={handleDelete}
          onOpenDetails={vi.fn()}
        />
      );
    });

    // Should render Pending status badge
    expect(container.textContent).toContain('Pending');
    expect(container.textContent).toContain('Emily Watson');

    // Should render checkbox and respond to click
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(true);

    act(() => {
      checkbox.click();
    });
    expect(handleToggle).toHaveBeenCalledWith('rev_pending_1');
  });

  it('5. ReviewTable supports row selection checkboxes and one-click moderation', () => {
    const selectedSet = new Set(['rev_pending_1']);
    const handleToggle = vi.fn();
    const handleStatus = vi.fn();

    act(() => {
      root.render(
        <ReviewTable
          reviews={mockPendingReviews}
          selectedIds={selectedSet}
          onToggleSelect={handleToggle}
          onUpdateStatus={handleStatus}
          onToggleFeatured={vi.fn()}
          onDelete={vi.fn()}
          onOpenDetails={vi.fn()}
        />
      );
    });

    // Should render table with both reviews
    expect(container.textContent).toContain('Emily Watson');
    expect(container.textContent).toContain('Marcus Chen');

    // Should have checkboxes
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);

    // First checkbox should be checked
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);

    // Toggle second checkbox
    act(() => {
      (checkboxes[1] as HTMLInputElement).click();
    });
    expect(handleToggle).toHaveBeenCalledWith('rev_pending_2');
  });
});
