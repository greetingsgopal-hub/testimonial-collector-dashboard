import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { WorkspaceSettings } from '../WorkspaceSettings';
import { AuthContext } from '../../../context/AuthContext';

describe('WorkspaceSettings Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderWithAuth = async (ui: React.ReactElement, authOverrides: any = {}) => {
    const mockAuthValue: any = {
      user: { uid: 'test-user', email: 'founder@pandapraise.com', displayName: 'Founder Gopal' },
      project: { id: 'proj-demo-1', name: 'Panda Praise' },
      workspace: { id: 'ws-1', name: 'Main Workspace', plan: 'pro' },
      allProjects: [{ id: 'proj-demo-1', name: 'Panda Praise' }],
      updateProjectDetails: vi.fn().mockResolvedValue(true),
      deleteProjectById: vi.fn().mockResolvedValue(true),
      resetPassword: vi.fn().mockResolvedValue({ success: true }),
      ...authOverrides,
    };

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AuthContext.Provider value={mockAuthValue}>
          {ui}
        </AuthContext.Provider>
      );
    });
    return { root, mockAuthValue };
  };

  it('renders workspace details and usage overview in General tab', async () => {
    await renderWithAuth(<WorkspaceSettings />);

    expect(container.textContent).toContain('Workspace Settings');
    expect(container.textContent).toContain('Workspace Details');
    expect(container.textContent).toContain('Usage Overview');
    expect(container.textContent).toContain('Projects (1)');
  });

  it('renders Danger Zone with GDPR Article 17 deletion clause', async () => {
    await renderWithAuth(<WorkspaceSettings />);

    expect(container.textContent).toContain('Danger Zone');
    expect(container.textContent).toContain('GDPR Article 17 (Right to Erasure)');
    expect(container.textContent).toContain('Delete Workspace');
  });

  it('navigates to Security & Auth tab and shows reset password option', async () => {
    await renderWithAuth(<WorkspaceSettings />);

    const securityBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Security & Auth')
    );
    expect(securityBtn).toBeDefined();

    await act(async () => {
      securityBtn?.click();
    });

    expect(container.textContent).toContain('Account Credentials & Access');
    expect(container.textContent).toContain('founder@pandapraise.com');
    expect(container.textContent).toContain('Send Password Reset Link');
    expect(container.textContent).toContain('GDPR Article 17 Compliant');
  });
});
