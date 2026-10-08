import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { DashboardSidebar } from '../DashboardSidebar';

// Mock AuthContext
const mockSetActiveProject = vi.fn().mockResolvedValue(undefined);
const mockCreateNewProject = vi.fn().mockImplementation(async (name: string) => ({
  id: `proj_${name.toLowerCase()}`,
  name,
  slug: name.toLowerCase(),
  createdAt: new Date().toISOString(),
}));
const mockSignOut = vi.fn().mockResolvedValue(undefined);

const mockUser = {
  id: 'user_123',
  uid: 'user_123',
  email: 'alex@example.com',
  displayName: 'Alex Rivers',
  emailVerified: true,
};

const mockWorkspace = {
  id: 'ws_alpha',
  name: 'Acme SaaS Corp',
  slug: 'acme-saas',
  plan: 'pro' as const,
  ownerId: 'user_123',
  createdAt: new Date().toISOString(),
};

const mockProject = {
  id: 'proj_1',
  name: 'Acme SaaS Corp',
  slug: 'acme-saas',
  createdAt: new Date().toISOString(),
};

const mockAllProjects = [
  { id: 'proj_1', name: 'Acme SaaS Corp', slug: 'acme-saas', createdAt: new Date().toISOString() },
  { id: 'proj_2', name: 'Panda Mobile App', slug: 'panda-mobile', createdAt: new Date().toISOString() },
];

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    workspace: mockWorkspace,
    project: mockProject,
    allProjects: mockAllProjects,
    setActiveProject: mockSetActiveProject,
    createNewProject: mockCreateNewProject,
    signOut: mockSignOut,
  }),
}));

describe('DashboardSidebar - Unified Sidebar Footer & Ergonomics', () => {
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

  it('1. Top workspace header displays active workspace name matching bottom naming convention', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={vi.fn()}
            proofCount={5}
          />
        </MemoryRouter>
      );
    });

    const topName = container.querySelector('#sidebar-top-workspace-name');
    expect(topName).not.toBeNull();
    expect(topName?.textContent).toContain('Acme SaaS Corp');

    // Shows Active Workspace pulse badge
    expect(container.textContent).toContain('Active Workspace');
  });

  it('2. Renders all standard navigation links cleanly spaced with badge count', async () => {
    const setActiveTab = vi.fn();

    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={setActiveTab}
            proofCount={4}
          />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Welcome Hub');
    expect(container.textContent).toContain('Collect');
    expect(container.textContent).toContain('Import');
    expect(container.textContent).toContain('Moderation Queue');
    expect(container.textContent).toContain('4'); // proof count badge
    expect(container.textContent).toContain('Widgets');
    expect(container.textContent).toContain('Post Online');
    expect(container.textContent).toContain('Integrations');
  });

  it('3. Bottom profile chip shows user name, avatar initial, and active workspace name', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={vi.fn()}
          />
        </MemoryRouter>
      );
    });

    const chip = container.querySelector('#sidebar-profile-chip');
    expect(chip).not.toBeNull();

    const nameEl = container.querySelector('#sidebar-profile-display-name');
    expect(nameEl?.textContent).toContain('Alex Rivers');

    const wsEl = container.querySelector('#sidebar-profile-workspace-name');
    expect(wsEl?.textContent).toContain('Acme SaaS Corp');
  });

  it('4. Clicking bottom profile chip toggles unified popover with project list, checkmark, and plan badge', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={vi.fn()}
          />
        </MemoryRouter>
      );
    });

    // Dropdown initially closed
    expect(container.querySelector('#sidebar-profile-dropdown')).toBeNull();

    const chip = container.querySelector('#sidebar-profile-chip') as HTMLButtonElement;
    await act(async () => {
      chip.click();
    });

    // Dropdown open
    const dropdown = container.querySelector('#sidebar-profile-dropdown');
    expect(dropdown).not.toBeNull();

    // Plan badge
    expect(dropdown?.textContent).toContain('PRO');

    // Projects list with active checkmark
    expect(dropdown?.textContent).toContain('Acme SaaS Corp');
    expect(dropdown?.textContent).toContain('Panda Mobile App');

    // Clicking second project switches active project
    const projectButtons = dropdown?.querySelectorAll('#sidebar-project-list button');
    expect(projectButtons?.length).toBe(2);

    await act(async () => {
      (projectButtons?.[1] as HTMLButtonElement).click();
    });

    expect(mockSetActiveProject).toHaveBeenCalledWith(mockAllProjects[1]);
  });

  it('5. Create New Workspace quick action opens inline form and triggers creation', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={vi.fn()}
          />
        </MemoryRouter>
      );
    });

    const chip = container.querySelector('#sidebar-profile-chip') as HTMLButtonElement;
    await act(async () => {
      chip.click();
    });

    const createBtn = container.querySelector('#create-workspace-btn') as HTMLButtonElement;
    expect(createBtn).not.toBeNull();

    await act(async () => {
      createBtn.click();
    });

    // Form inputs
    const input = container.querySelector('#sidebar-profile-dropdown input') as HTMLInputElement;
    expect(input).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(input, 'New Studio Alpha');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const form = container.querySelector('#sidebar-profile-dropdown form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockCreateNewProject).toHaveBeenCalledWith('New Studio Alpha');
  });

  it('6. Account Settings navigates to settings tab, and Sign Out triggers signOut()', async () => {
    const setActiveTab = vi.fn();

    await act(async () => {
      root.render(
        <MemoryRouter>
          <DashboardSidebar
            activeTab="welcome"
            setActiveTab={setActiveTab}
          />
        </MemoryRouter>
      );
    });

    const chip = container.querySelector('#sidebar-profile-chip') as HTMLButtonElement;
    await act(async () => {
      chip.click();
    });

    const settingsBtn = container.querySelector('#sidebar-account-settings-btn') as HTMLButtonElement;
    expect(settingsBtn).not.toBeNull();

    await act(async () => {
      settingsBtn.click();
    });
    expect(setActiveTab).toHaveBeenCalledWith('settings');

    // Reopen dropdown for sign out
    await act(async () => {
      chip.click();
    });

    const signOutBtn = container.querySelector('#sidebar-sign-out-btn') as HTMLButtonElement;
    expect(signOutBtn).not.toBeNull();

    await act(async () => {
      signOutBtn.click();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
