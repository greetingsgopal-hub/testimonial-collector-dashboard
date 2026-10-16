import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { isSuperadmin } from '../../lib/admin';
import { SuperadminGuard } from '../../components/auth/SuperadminGuard';
import { AdminPage } from '../AdminPage';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Superadmin Access & AdminPage', () => {
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
  });

  describe('isSuperadmin helper', () => {
    it('allows default superadmin emails', () => {
      expect(isSuperadmin('hello@pandapraise.com')).toBe(true);
      expect(isSuperadmin('admin@pandapraise.com')).toBe(true);
      expect(isSuperadmin('FOUNDER@PANDAPRAISE.COM')).toBe(true);
      expect(isSuperadmin('greetingsgopal@gmail.com')).toBe(true);
      expect(isSuperadmin('greetings.gopal@gmail.com')).toBe(true);
    });

    it('denies standard user emails', () => {
      expect(isSuperadmin('customer@example.com')).toBe(false);
      expect(isSuperadmin('')).toBe(false);
      expect(isSuperadmin(null)).toBe(false);
      expect(isSuperadmin(undefined)).toBe(false);
    });
  });

  describe('SuperadminGuard', () => {
    it('shows loading indicator while auth is loading', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      });

      await act(async () => {
        root.render(
          <MemoryRouter>
            <SuperadminGuard>
              <div>Secret Admin Dashboard</div>
            </SuperadminGuard>
          </MemoryRouter>
        );
      });

      expect(container.textContent).toContain('Verifying administrator privileges...');
      expect(container.textContent).not.toContain('Secret Admin Dashboard');
    });

    it('redirects non-admin users to /dashboard', async () => {
      mockUseAuth.mockReturnValue({
        user: { email: 'normal_user@example.com', uid: 'u1' },
        isLoading: false,
      });

      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route
                path="/admin"
                element={
                  <SuperadminGuard>
                    <div>Secret Admin Dashboard</div>
                  </SuperadminGuard>
                }
              />
              <Route path="/dashboard" element={<div>User Dashboard</div>} />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(container.textContent).toContain('User Dashboard');
      expect(container.textContent).not.toContain('Secret Admin Dashboard');
    });

    it('allows authorized superadmins through', async () => {
      mockUseAuth.mockReturnValue({
        user: { email: 'admin@pandapraise.com', uid: 'u_admin' },
        isLoading: false,
      });

      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={['/admin']}>
            <SuperadminGuard>
              <div>Secret Admin Dashboard</div>
            </SuperadminGuard>
          </MemoryRouter>
        );
      });

      expect(container.textContent).toContain('Secret Admin Dashboard');
    });
  });

  describe('AdminPage component - 4-Tab Control Center', () => {
    const mockWorkspaces = [
      {
        id: 'ws_alpha',
        name: 'Alpha Brand',
        ownerId: 'uid_111',
        owner_email: 'alpha@example.com',
        plan: 'free',
        proofs_count: 5,
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'ws_beta',
        name: 'Beta SaaS',
        ownerId: 'uid_222',
        owner_email: 'beta@example.com',
        plan: 'pro',
        proofs_count: 12,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'ws_gamma',
        name: 'Gamma Enterprise',
        ownerId: 'uid_333',
        owner_email: 'gamma@example.com',
        plan: 'founding_lifetime',
        proofs_count: 42,
        createdAt: '2026-04-01T00:00:00Z',
      },
    ];

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          email: 'admin@pandapraise.com',
          uid: 'u_admin',
          getIdToken: vi.fn().mockResolvedValue('admin_bearer_token'),
        },
      });

      // Mock global fetch
      global.fetch = vi.fn().mockImplementation((url: string, _options: any) => {
        if (url === '/api/admin/workspaces') {
          return Promise.resolve(
            new Response(JSON.stringify({ workspaces: mockWorkspaces }), { status: 200 })
          );
        }
        if (url === '/api/admin/testimonials') {
          return Promise.resolve(
            new Response(JSON.stringify({ reviews: [] }), { status: 200 })
          );
        }
        if (url.includes('/api/admin/workspaces/ws_alpha/plan')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({ success: true, workspaceId: 'ws_alpha', plan: 'pro' }),
              { status: 200 }
            )
          );
        }
        return Promise.reject(new Error(`Unhandled fetch ${url}`));
      });
    });

    it('fetches workspaces and renders overview metrics in System Overview tab', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      expect(container.textContent).toContain('PandaPraise Control Center');
      expect(container.textContent).toContain('ADMIN CONSOLE');
      expect(container.textContent).toContain('Total Workspaces');
      expect(container.textContent).toContain('3');
      expect(container.textContent).toContain('Pro Accounts');
      expect(container.textContent).toContain('1');
      expect(container.textContent).toContain('System State');
      expect(container.textContent).toContain('READY');
    });

    it('switches to Workspaces tab and renders workspaces table', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      // Find and click the Workspaces tab button
      const workspacesTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Workspaces')
      );
      expect(workspacesTabBtn).toBeTruthy();

      await act(async () => {
        workspacesTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Alpha Brand');
      expect(container.textContent).toContain('Beta SaaS');
      expect(container.textContent).toContain('Gamma Enterprise');
    });

    it('filters workspaces by search input in Workspaces tab', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      const workspacesTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Workspaces')
      );
      await act(async () => {
        workspacesTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Alpha Brand');

      const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      expect(searchInput).toBeTruthy();

      await act(async () => {
        searchInput.value = 'Beta';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeInputValueSetter?.call(searchInput, 'Beta');
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(container.textContent).toContain('Beta SaaS');
    });

    it('updates workspace plan when toggle button is clicked', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      const workspacesTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Workspaces')
      );
      await act(async () => {
        workspacesTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Alpha Brand');

      const toggleButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
        b.textContent?.includes('Toggle')
      );
      expect(toggleButtons.length).toBeGreaterThan(0);

      await act(async () => {
        toggleButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/workspaces/'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('switches to Ledger tab and renders payment ledger', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      const paymentsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Ledger')
      );
      expect(paymentsTabBtn).toBeTruthy();

      await act(async () => {
        paymentsTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Razorpay Settlement Ledger');
      expect(container.textContent).toContain('Paid');
    });

    it('switches to System Health tab and renders cluster health', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <AdminPage />
          </MemoryRouter>
        );
      });

      const healthTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('System Health')
      );
      expect(healthTabBtn).toBeTruthy();

      await act(async () => {
        healthTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Edge Worker');
      expect(container.textContent).toContain('Database Cluster');
      expect(container.textContent).toContain('Razorpay Webhooks');
    });
  });
});
