import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntegrateView } from '../IntegrateView';

// Mock dependencies
vi.mock('../../../lib/socialClient', () => ({
  socialClient: {
    getStatus: vi.fn().mockResolvedValue({
      connections: {
        linkedin: { connected: false, status: 'disconnected' },
      },
    }),
    initOAuth: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock('../ConnectSourceModal', () => ({
  ConnectSourceModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="connect-source-modal">ConnectSourceModal Open</div> : null,
}));

vi.mock('../../WebhookConfigModal', () => ({
  WebhookConfigModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="webhook-config-modal">WebhookConfigModal Open</div> : null,
}));

describe('IntegrateView - Categorized Marketplace & Layout Restructure', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
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

  it('1. Renders compact Chrome Extension hero anchor and dedicated Account & Billing card group', async () => {
    await act(async () => {
      root.render(<IntegrateView />);
    });

    // Compact Chrome Extension Hero Anchor
    expect(container.textContent).toContain('PandaPraise 1-Click Clipper (Chrome Extension)');
    expect(container.textContent).toContain('Get Extension');
    expect(container.textContent).toContain('Twitter/X, LinkedIn, WhatsApp Web & Slack');

    // Dedicated Account & Billing Management Card Section
    expect(container.textContent).toContain('Account & Billing Management');
    expect(container.textContent).toContain('Stripe Connected');
    expect(container.textContent).toContain('Free Plan');
    expect(container.textContent).toContain('Upgrade Plan');
  });

  it('2. Category Filter Tabs instantly filter the marketplace card grid', async () => {
    await act(async () => {
      root.render(<IntegrateView />);
    });

    // Check all filter tab buttons are rendered
    const buttons = Array.from(container.querySelectorAll('button'));
    const allTab = buttons.find((b) => b.textContent?.trim() === 'All Categories');
    const activeTab = buttons.find((b) => b.textContent?.trim() === 'Active & Connected');
    const reviewsTab = buttons.find((b) => b.textContent?.trim() === 'Review Imports');
    const notificationsTab = buttons.find((b) => b.textContent?.trim() === 'Team Notifications');
    const webhooksTab = buttons.find((b) => b.textContent?.trim() === 'Webhooks');

    expect(allTab).toBeDefined();
    expect(activeTab).toBeDefined();
    expect(reviewsTab).toBeDefined();
    expect(notificationsTab).toBeDefined();
    expect(webhooksTab).toBeDefined();

    // Helper to get active card titles in the marketplace grid
    const getVisibleCardTitles = () =>
      Array.from(container.querySelectorAll('.grid h3')).map((h) => h.textContent?.trim());

    // 1. Switch to "Active & Connected"
    await act(async () => {
      activeTab!.click();
    });
    const activeCards = getVisibleCardTitles();
    expect(activeCards).toContain('LinkedIn');
    expect(activeCards).toContain('Facebook Page');
    expect(activeCards).toContain('Instagram');
    expect(activeCards).toContain('Review Collection Webhooks');
    expect(activeCards).not.toContain('Trustpilot');

    // 2. Switch to "Review Imports"
    await act(async () => {
      reviewsTab!.click();
    });
    const reviewCards = getVisibleCardTitles();
    expect(reviewCards).toContain('Google Reviews');
    expect(reviewCards).toContain('Trustpilot');
    expect(reviewCards).not.toContain('LinkedIn');

    // 3. Switch to "Team Notifications"
    await act(async () => {
      notificationsTab!.click();
    });
    const notificationCards = getVisibleCardTitles();
    expect(notificationCards).toContain('Slack');
    expect(notificationCards).toContain('Microsoft Teams');
    expect(notificationCards).not.toContain('Google Reviews');

    // 4. Switch to "Webhooks"
    await act(async () => {
      webhooksTab!.click();
    });
    const webhookCards = getVisibleCardTitles();
    expect(webhookCards).toContain('Review Collection Webhooks');
    expect(webhookCards).toContain('REST API');
    expect(webhookCards).toContain('Zapier');
    expect(webhookCards).not.toContain('Microsoft Teams');
  });

  it('3. In "All Categories" view, displays collapsible Upcoming Integrations & Waitlist tray', async () => {
    await act(async () => {
      root.render(<IntegrateView />);
    });

    // Primary operational tools are visible
    expect(container.textContent).toContain('LinkedIn');
    expect(container.textContent).toContain('Google Reviews');

    // Upcoming tray header is rendered
    expect(container.textContent).toContain('Upcoming Integrations & Waitlist');

    const toggleUpcomingBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Upcoming Tools')
    );
    expect(toggleUpcomingBtn).toBeDefined();
    expect(toggleUpcomingBtn?.textContent).toContain('Show Upcoming Tools');

    // Click to expand upcoming integrations
    await act(async () => {
      toggleUpcomingBtn!.click();
    });

    expect(toggleUpcomingBtn?.textContent).toContain('Hide Upcoming Tools');
    expect(container.textContent).toContain('Slack');
    expect(container.textContent).toContain('Zapier');

    // Join waitlist toggles state
    const waitlistBtns = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Join Waitlist')
    );
    expect(waitlistBtns.length).toBeGreaterThan(0);

    await act(async () => {
      waitlistBtns[0].click();
    });

    expect(container.textContent).toContain('Joined Waitlist');
  });

  it('4. Standardized Status Badges and outline Connect buttons', async () => {
    // Set LinkedIn and Facebook to connected in localStorage
    localStorage.setItem('pandapraise_linkedin_connected', 'true');
    localStorage.setItem('pandapraise_linkedin_name', 'Jane Doe');
    localStorage.setItem('pandapraise_facebook_connected', 'true');
    localStorage.setItem('pandapraise_facebook_name', 'Acme Store');

    await act(async () => {
      root.render(<IntegrateView />);
    });

    // Connected badges
    const connectedBadges = Array.from(container.querySelectorAll('span')).filter((s) =>
      s.textContent?.trim() === 'Connected'
    );
    expect(connectedBadges.length).toBeGreaterThanOrEqual(2);

    expect(container.textContent).toContain('Jane Doe');
    expect(container.textContent).toContain('Acme Store');

    // Disconnect buttons are present
    const disconnectBtn = container.querySelector('#disconnect-linkedin-btn');
    expect(disconnectBtn).toBeDefined();
  });

  it('5. Webhook modal opens when clicking Configure Webhook Triggers', async () => {
    await act(async () => {
      root.render(<IntegrateView />);
    });

    const webhookBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Configure Webhook Triggers')
    );
    expect(webhookBtn).toBeDefined();

    await act(async () => {
      webhookBtn!.click();
    });

    expect(container.querySelector('[data-testid="webhook-config-modal"]')).not.toBeNull();
  });
});
