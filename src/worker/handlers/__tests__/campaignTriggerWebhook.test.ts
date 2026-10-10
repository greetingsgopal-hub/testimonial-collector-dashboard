import { describe, it, expect } from 'vitest';
import { handleCampaignTriggerWebhook } from '../campaignTriggerWebhook';
import { computeHmacSha256, verifyHmacSha256 } from '../../lib/hmac';
import { WorkerEnv } from '../../types';

describe('HMAC Verification & Campaign Trigger Webhook', () => {
  const secret = 'super-secret-pandapraise-webhook-token-99';
  const envWithSecret: Partial<WorkerEnv> = {
    CAMPAIGN_WEBHOOK_SECRET: secret,
  };
  const envNoSecret: Partial<WorkerEnv> = {};

  it('computes and verifies HMAC-SHA256 signatures with constant time check', () => {
    const payload = JSON.stringify({ customerEmail: 'test@example.com', orderId: 'ord_123' });
    const signature = computeHmacSha256(secret, payload);

    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // 32 bytes hex = 64 chars
    expect(verifyHmacSha256(secret, payload, signature)).toBe(true);
    expect(verifyHmacSha256(secret, payload, `sha256=${signature}`)).toBe(true);
    expect(verifyHmacSha256(secret, payload, 'invalid-signature')).toBe(false);
    expect(verifyHmacSha256('different-secret', payload, signature)).toBe(false);
  });

  it('rejects non-POST methods with 405', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/campaign-trigger', {
      method: 'GET',
    });
    const res = await handleCampaignTriggerWebhook(req, envNoSecret as WorkerEnv);
    expect(res.status).toBe(405);
  });

  it('blocks requests without signature when secret is configured', async () => {
    const payload = JSON.stringify({ customerEmail: 'vip@corp.com' });
    const req = new Request('https://pandapraise.com/api/webhook/campaign-trigger', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleCampaignTriggerWebhook(req, envWithSecret as WorkerEnv);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Missing required webhook signature');
  });

  it('blocks requests with invalid HMAC signature', async () => {
    const payload = JSON.stringify({ customerEmail: 'vip@corp.com' });
    const req = new Request('https://pandapraise.com/api/webhook/campaign-trigger', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-PandaPraise-Signature': 'sha256=badf00d1234567890badf00d1234567890badf00d1234567890badf00d12345678',
      },
    });
    const res = await handleCampaignTriggerWebhook(req, envWithSecret as WorkerEnv);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Invalid webhook signature');
  });

  it('accepts valid signed payload and schedules review invite with delay', async () => {
    const payload = JSON.stringify({
      customerEmail: 'sarah.connor@example.com',
      customerName: 'Sarah Connor',
      productName: 'Cyberdyne Defense System',
      orderId: 't800_order',
      channel: 'email',
      delayDays: 3,
      spaceSlug: 'cyberdyne',
    });
    const signature = computeHmacSha256(secret, payload);

    const req = new Request('https://pandapraise.com/api/webhook/campaign-trigger', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-PandaPraise-Signature': signature,
      },
    });

    const res = await handleCampaignTriggerWebhook(req, envWithSecret as WorkerEnv);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.channel).toBe('email');
    expect(data.recipient.email).toBe('sarah.connor@example.com');
    expect(data.scheduledFor).toBeDefined();
    expect(new Date(data.scheduledFor).getTime()).toBeGreaterThan(Date.now() + 2 * 86400000);
    expect(data.inviteUrl).toContain('/c/cyberdyne?');
    expect(data.trackingUrl).toContain('/api/campaigns/track-click?');
  });

  it('accepts WhatsApp webhook with phone number and validates formatting', async () => {
    const payload = JSON.stringify({
      customerPhone: '+14155552671',
      customerName: 'John Doe',
      productName: 'Sneaker Clean Kit',
      channel: 'whatsapp',
      delayDays: 1,
    });

    const req = new Request('https://pandapraise.com/api/webhook/campaign-trigger', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await handleCampaignTriggerWebhook(req, envNoSecret as WorkerEnv);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.channel).toBe('whatsapp');
    expect(data.recipient.phone).toBe('+14155552671');
  });
});
