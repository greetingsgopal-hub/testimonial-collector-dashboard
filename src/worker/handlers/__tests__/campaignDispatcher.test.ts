import { describe, it, expect } from 'vitest';
import { interpolateTemplate, dispatchEmailInvite, dispatchWhatsAppInvite } from '../../lib/campaignDispatcher';
import { handleCampaignTrackClick } from '../campaignTrackHandler';
import { WorkerEnv } from '../../types';

describe('Campaign Dispatcher Engine & Tracking', () => {
  const dummyEnv: WorkerEnv = {
    ASSETS: { fetch: async () => new Response() },
  };

  it('interpolates single and multiple variable tokens into template', () => {
    const template = 'Hi {{customer_name}}, thank you for buying {{product_name}} from {{company_name}}! Review here: {{invite_url}}';
    const result = interpolateTemplate(template, {
      customer_name: 'Elena Rostova',
      product_name: 'Wireless Earbuds Pro',
      company_name: 'Acoustic Sound',
      invite_url: 'https://pandapraise.com/c/acoustic?ref=123',
    });

    expect(result).toBe('Hi Elena Rostova, thank you for buying Wireless Earbuds Pro from Acoustic Sound! Review here: https://pandapraise.com/c/acoustic?ref=123');
  });

  it('provides safe fallbacks for missing template variables', () => {
    const template = 'Hello {{customer_name}}, please rate {{product_name}} with {{company_name}}!';
    const result = interpolateTemplate(template, {});

    expect(result).toBe('Hello there, please rate your recent purchase with our team!');
  });

  it('simulates email dispatch successfully when API key is in sandbox mode', async () => {
    const res = await dispatchEmailInvite(dummyEnv, {
      to: 'elena@example.com',
      subject: 'Quick question about your purchase',
      textBody: 'Hi Elena, would you mind sharing your feedback?',
      ctaUrl: 'https://pandapraise.com/c/acoustic',
      ctaText: 'Rate Products',
    });

    expect(res.success).toBe(true);
    expect(res.messageId).toContain('sim_email_');
  });

  it('rejects email dispatch if email is malformed', async () => {
    const res = await dispatchEmailInvite(dummyEnv, {
      to: 'invalid-email-address',
      subject: 'Review us',
      textBody: 'Feedback',
      ctaUrl: 'https://pandapraise.com/c/acoustic',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid recipient email');
  });

  it('simulates WhatsApp dispatch successfully', async () => {
    const res = await dispatchWhatsAppInvite(dummyEnv, {
      to: '+14155552671',
      message: 'Hey Elena! Hope you are enjoying the earbuds.',
      ctaUrl: 'https://pandapraise.com/c/acoustic',
    });

    expect(res.success).toBe(true);
    expect(res.messageId).toContain('sim_wa_');
  });

  it('redirects click track requests to target collection form with 302', async () => {
    const targetUrl = 'https://pandapraise.com/c/custom-space?ref=order_777';
    const req = new Request(`https://pandapraise.com/api/campaigns/track-click?cid=camp-vip&to=${encodeURIComponent(targetUrl)}`);
    const res = await handleCampaignTrackClick(req, dummyEnv);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(targetUrl);
    expect(res.headers.get('X-Tracked-Campaign')).toBe('camp-vip');
  });
});
