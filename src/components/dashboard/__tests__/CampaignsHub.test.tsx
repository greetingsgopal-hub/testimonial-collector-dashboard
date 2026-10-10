import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { CampaignsHub } from '../CampaignsHub';
import { AuthContext } from '../../../context/AuthContext';

describe('CampaignsHub Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderWithAuth = async (ui: React.ReactElement) => {
    const mockAuthValue: any = {
      user: { uid: 'test-user', email: 'test@pandapraise.com', displayName: 'Test Founder' },
      project: { id: 'proj-demo-1', name: 'Panda Praise' },
      workspace: { id: 'ws-1', name: 'Main', plan: 'pro' },
      allProjects: [{ id: 'proj-demo-1', name: 'Panda Praise' }],
    };

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AuthContext.Provider value={mockAuthValue}>
          {ui}
        </AuthContext.Provider>
      );
    });
    // Wait for async loadCampaigns to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    return root;
  };

  const waitForLoaded = async () => {
    for (let i = 0; i < 30; i++) {
      if (!container.textContent?.includes('Loading automated campaigns...')) {
        return;
      }
      await act(async () => {
        await new Promise((r) => setTimeout(r, 25));
      });
    }
  };

  it('renders the header and KPI metric summary cards', async () => {
    await renderWithAuth(<CampaignsHub />);
    await waitForLoaded();

    expect(container.textContent).toContain('Automated Review Request Drips');
    expect(container.textContent).toContain('Active Automations');
    expect(container.textContent).toContain('Total Invites Sent');
    expect(container.textContent).toContain('Average Click Rate');
    expect(container.textContent).toContain('Review Conversion');
  });

  it('displays default starter email and WhatsApp campaigns', async () => {
    await renderWithAuth(<CampaignsHub />);
    await waitForLoaded();

    expect(container.textContent).toContain('Post-Purchase Email Delight');
    expect(container.textContent).toContain('WhatsApp Instant Feedback');
    expect(container.textContent).toContain('Email Drip');
    expect(container.textContent).toContain('WhatsApp Drip');
  });

  it('opens create campaign modal with live interactive preview', async () => {
    await renderWithAuth(<CampaignsHub />);

    const createBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Create Campaign')
    );
    expect(createBtn).toBeDefined();

    await act(async () => {
      createBtn?.click();
    });

    expect(container.textContent).toContain('Create Automated Review Campaign');
    expect(container.textContent).toContain('Dispatch Channel');
    expect(container.textContent).toContain('Insert Dynamic Variables');
    expect(container.textContent).toContain('Interactive Recipient Preview');
  });

  it('opens inbound webhook docs drawer with endpoint information', async () => {
    await renderWithAuth(<CampaignsHub />);

    const docsBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Inbound Webhook Docs')
    );
    expect(docsBtn).toBeDefined();

    await act(async () => {
      docsBtn?.click();
    });

    expect(container.textContent).toContain('Inbound Trigger Webhook');
    expect(container.textContent).toContain('/api/webhook/campaign-trigger');
    expect(container.textContent).toContain('HMAC-SHA256 Signature Verification');
  });
});
