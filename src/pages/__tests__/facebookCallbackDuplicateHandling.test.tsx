import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext
const mockUser = {
  id: 'usr_test123',
  uid: 'usr_test123',
  email: 'owner@example.com',
  displayName: 'Test Owner',
  emailVerified: true,
};

const mockProject = {
  id: 'proj_test123',
  name: 'Main Brand',
  workspaceId: 'ws_test123',
  slug: 'main-brand',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockWorkspace = {
  id: 'ws_test123',
  name: 'Test Workspace',
  ownerId: 'usr_test123',
  plan: 'free',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    project: mockProject,
    projects: [mockProject],
    workspace: mockWorkspace,
    activeProjectId: 'proj_test123',
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
  }),
}));

// Mock storage
vi.mock('../../lib/storage', () => ({
  storage: {
    getReviews: vi.fn().mockResolvedValue([]),
    getStats: vi.fn().mockResolvedValue({ total: 0, approved: 0, pending: 0, averageRating: 5 }),
    getCollectionForm: vi.fn().mockResolvedValue(null),
    getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
  },
  getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
}));

// Mock socialClient
vi.mock('../../lib/socialClient', () => ({
  socialClient: {
    getStatus: vi.fn().mockResolvedValue({ connections: {} }),
    disconnect: vi.fn().mockResolvedValue(true),
    initOAuth: vi.fn().mockResolvedValue({ authUrl: 'https://facebook.com/dialog/oauth' }),
    listFacebookPages: vi.fn().mockResolvedValue({
      pages: [{ pageId: 'pg_123', name: 'Panda Praise HQ' }],
    }),
    selectFacebookPage: vi.fn().mockResolvedValue({
      status: 'IMPORT_SUCCESS',
      importedCount: 5,
      pageName: 'Panda Praise HQ',
    }),
  },
}));

// Mock firebase
vi.mock('../../lib/firebase', () => ({
  getFirebaseAuth: () => ({ currentUser: { getIdToken: async () => 'test-id-token' } }),
  auth: {},
  db: {},
  isFirebaseConfigured: () => false,
}));

// Mock confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import DashboardPage from '../DashboardPage';
import { IntegrateView } from '../../components/dashboard/views/IntegrateView';

describe('Facebook OAuth Callback Single-Ownership Regression Suite', () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalLocation = window.location;
  let replaceStateSpy: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();

    replaceStateSpy = vi.spyOn(window.history, 'replaceState');
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    delete (window as any).location;
    window.location = originalLocation;
  });

  function setWindowSearch(search: string) {
    delete (window as any).location;
    window.location = new URL(`https://pandapraise.com/dashboard${search}`) as any;
  }

  it('1. A Facebook callback containing fb_outcome=fb_token_exchange_failed and social_error is handled by IntegrateView and is NOT consumed by DashboardPage', async () => {
    setWindowSearch('?tab=integrate&fb_outcome=fb_token_exchange_failed&social_error=Token%20exchange%20failed');

    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // DashboardPage must NOT render the generic "Social Connection Notice" banner
    const dashboardHtml = container.innerHTML;
    expect(dashboardHtml).not.toContain('Social Connection Notice: Token exchange failed');
    expect(dashboardHtml).not.toContain('Social Connection Notice:');

    // IntegrateView must be rendered and handle the Facebook outcome banner
    const banner = container.querySelector('#facebook-outcome-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Facebook Connection Notice');
    expect(banner?.textContent).toContain('Facebook connection failed during authorization. Please try connecting your Facebook Page again.');
  });

  it('2. IntegrateView handles fb_token_exchange_failed explicitly without generic banner', async () => {
    setWindowSearch('?fb_outcome=fb_token_exchange_failed&social_error=Failed%20to%20complete%20Facebook%20authentication.%20Please%20try%20again.');

    await act(async () => {
      root.render(<IntegrateView />);
    });

    // IntegrateView must render its dedicated Facebook Outcome banner
    const banner = container.querySelector('#facebook-outcome-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Facebook Connection Notice');
    expect(banner?.textContent).toContain('Facebook connection failed during authorization. Please try connecting your Facebook Page again.');

    // Must NOT display generic DashboardPage banner prefix or raw error codes
    expect(container.innerHTML).not.toContain('Social Connection Notice:');
    expect(container.innerHTML).not.toContain('OAuthException');

    // IntegrateView cleans the URL after capturing the outcome
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('3. IntegrateView handles fb_no_pages explicitly with customer-friendly instructions', async () => {
    setWindowSearch('?fb_outcome=fb_no_pages');

    await act(async () => {
      root.render(<IntegrateView />);
    });

    const banner = container.querySelector('#facebook-outcome-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('No Facebook Pages found. Please ensure you have admin access to a Facebook Business Page, then try again.');
  });

  it('4. fb_oauth_success opens the Facebook Page-selection flow', async () => {
    setWindowSearch('?fb_outcome=fb_oauth_success&social_connected=facebook&account_name=Panda%20Praise%20HQ');

    await act(async () => {
      root.render(<IntegrateView />);
    });

    // Facebook Page picker modal must be opened
    const modal = container.querySelector('#facebook-page-picker-modal');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Select a Facebook Page');
    expect(modal?.textContent).toContain('Panda Praise HQ');

    // Must contain confirmation button
    const confirmBtn = container.querySelector('#confirm-facebook-page-btn');
    expect(confirmBtn).not.toBeNull();
    expect(confirmBtn?.textContent).toContain('Continue');

    // Confirming page selection connects Facebook and cleans history
    await act(async () => {
      (confirmBtn as HTMLButtonElement).click();
    });

    expect(localStorage.getItem('pandapraise_facebook_connected')).toBe('true');
    expect(localStorage.getItem('pandapraise_facebook_name')).toBe('Panda Praise HQ');
    expect(container.querySelector('#facebook-page-picker-modal')).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('5. Legacy non-Facebook OAuth callbacks (e.g. LinkedIn) are preserved in DashboardPage', async () => {
    setWindowSearch('?social_connected=linkedin&account_name=Jane%20Doe');

    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // DashboardPage should display standard non-Facebook success notice and replace state
    expect(replaceStateSpy).toHaveBeenCalled();
    const dashboardHtml = container.innerHTML;
    expect(dashboardHtml).toContain('Successfully connected LINKEDIN as Jane Doe!');
  });
});
