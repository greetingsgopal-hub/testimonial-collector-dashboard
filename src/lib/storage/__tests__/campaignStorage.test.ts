import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../localStorageAdapter';
import { CampaignInput, CampaignLogInput } from '../../../types';

describe('Campaign Storage (LocalStorageAdapter)', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  it('loads default starter campaigns when empty', async () => {
    const campaigns = await adapter.getCampaigns('proj-demo-1');
    expect(campaigns.length).toBeGreaterThanOrEqual(2);
    expect(campaigns.some((c) => c.channel === 'email')).toBe(true);
    expect(campaigns.some((c) => c.channel === 'whatsapp')).toBe(true);
  });

  it('creates and retrieves a new campaign', async () => {
    const newCamp: CampaignInput = {
      projectId: 'proj-demo-1',
      ownerId: 'user-123',
      name: 'VIP Milestone Campaign',
      channel: 'email',
      status: 'active',
      triggerType: 'webhook',
      delayDays: 5,
      template: {
        subject: 'Special milestone with {{company_name}}',
        messageBody: 'Hi {{customer_name}}, you are awesome!',
        ctaText: 'Rate Us Now',
      },
    };

    const created = await adapter.createCampaign(newCamp, 'proj-demo-1');
    expect(created.id).toBeDefined();
    expect(created.name).toBe('VIP Milestone Campaign');
    expect(created.delayDays).toBe(5);

    const fetched = await adapter.getCampaignById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
  });

  it('updates campaign status and attributes', async () => {
    const campaigns = await adapter.getCampaigns('proj-demo-1');
    const first = campaigns[0];

    const updated = await adapter.updateCampaign(first.id, {
      status: 'paused',
      name: 'Renamed Campaign',
    });

    expect(updated.status).toBe('paused');
    expect(updated.name).toBe('Renamed Campaign');

    const refetched = await adapter.getCampaignById(first.id);
    expect(refetched?.status).toBe('paused');
  });

  it('creates and tracks campaign logs with delivery status', async () => {
    const logInput: CampaignLogInput = {
      campaignId: 'camp-test-1',
      projectId: 'proj-demo-1',
      ownerId: 'user-123',
      customerEmail: 'customer@example.com',
      customerName: 'Jordan Smith',
      productName: 'Pro Tier Subscription',
      orderId: 'ord_98765',
      channel: 'email',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 86400000).toISOString(),
      inviteUrl: 'https://pandapraise.com/c/feedback?ref=ord_98765',
    };

    const createdLog = await adapter.createCampaignLog(logInput);
    expect(createdLog.id).toBeDefined();
    expect(createdLog.status).toBe('scheduled');

    const logs = await adapter.getCampaignLogs('camp-test-1', 'proj-demo-1');
    expect(logs.length).toBe(1);
    expect(logs[0].customerEmail).toBe('customer@example.com');

    // Update to sent
    const sentLog = await adapter.updateCampaignLog(createdLog.id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    expect(sentLog.status).toBe('sent');
    expect(sentLog.sentAt).toBeDefined();
  });
});
