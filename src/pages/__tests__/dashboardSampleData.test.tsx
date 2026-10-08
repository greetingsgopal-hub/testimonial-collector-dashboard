import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { getSampleReviews } from '../../lib/mockData';

// Mock AuthContext
const mockUser = {
  id: 'usr_new_user',
  uid: 'usr_new_user',
  email: 'brandnew@example.com',
  displayName: 'New Founder',
  emailVerified: true,
};

const mockProject = {
  id: 'proj_empty_123',
  name: 'Brand New SaaS',
  workspaceId: 'ws_empty_123',
  slug: 'brand-new-saas',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockWorkspace = {
  id: 'ws_empty_123',
  name: 'Brand New Workspace',
  ownerId: 'usr_new_user',
  plan: 'free',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    project: mockProject,
    projects: [mockProject],
    workspace: mockWorkspace,
    activeProjectId: 'proj_empty_123',
    setActiveProjectId: vi.fn(),
    switchProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    createWorkspace: vi.fn(),
    switchWorkspace: vi.fn(),
    logout: vi.fn(),
    sendVerificationEmail: vi.fn(),
    loading: false,
    collectionForm: null,
  }),
}));

// Mock storage returning 0 reviews for brand-new account
let storageReviewsMock: any[] = [];
vi.mock('../../lib/storage', () => ({
  storage: {
    getReviews: vi.fn().mockImplementation(() => Promise.resolve(storageReviewsMock)),
    getStats: vi.fn().mockImplementation(() =>
      Promise.resolve({
        total: storageReviewsMock.length,
        approved: storageReviewsMock.length,
        pending: 0,
        averageRating: 5,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: storageReviewsMock.length },
      })
    ),
    getCollectionForm: vi.fn().mockResolvedValue(null),
    getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
  },
  getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
}));

describe('DashboardPage Sample Data Activation Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    storageReviewsMock = [];
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
  });

  it('1. Provides 3 realistic sample reviews for a brand new account with 0 real reviews', async () => {
    const samples = getSampleReviews('proj_empty_123');
    expect(samples.length).toBe(3);
    expect(samples[0].authorName).toContain('Sarah Jenkins');
    expect(samples[0].isSample).toBe(true);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // WelcomeView should render with sample reviews banner & 3 approved proof
    expect(container.textContent).toContain('You are viewing sample reviews');
    expect(container.textContent).toContain('Clear Sample Data');
  });

  it('2. Clicking Clear Sample Data removes sample reviews and persists clearance in localStorage', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    const clearBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      /clear sample data/i.test(b.textContent || '')
    );
    expect(clearBtn).toBeDefined();

    await act(async () => {
      clearBtn?.click();
    });

    // Check localStorage key is set
    expect(localStorage.getItem('panda_praise_sample_cleared_proj_empty_123')).toBe('true');
  });
});
