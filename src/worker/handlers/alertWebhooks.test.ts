import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatSlackTestimonialPayload,
  formatDiscordTestimonialPayload,
  formatGenericWebhookPayload,
  dispatchSlackAlert,
  dispatchDiscordAlert,
  dispatchGenericWebhook,
  handleWebhookTestDispatch,
} from './alertWebhooks';
import { WorkerEnv } from '../types';

describe('Real-Time Alert Webhooks (Task 3.2 & 3.3)', () => {
  const sampleReview = {
    id: 'rev_123',
    authorName: 'Sarah Jenkins',
    authorEmail: 'sarah@hypergrowth.io',
    authorCompany: 'HyperGrowth',
    rating: 5,
    text: 'PandaPraise increased our landing page conversion rate by 34% within 48 hours of installing the marquee widget!',
    spaceSlug: 'growth-studio',
    createdAt: '2026-10-14T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatSlackTestimonialPayload', () => {
    it('creates a formatted Slack Block Kit card with stars, author info, and approve link', () => {
      const payload = formatSlackTestimonialPayload(sampleReview, 'https://pandapraise.com');
      expect(payload.text).toContain('New 5-star testimonial from Sarah Jenkins');
      expect(payload.blocks).toBeDefined();
      expect(payload.blocks.length).toBeGreaterThanOrEqual(3);

      const headerBlock = payload.blocks.find((b: any) => b.type === 'header');
      expect(headerBlock).toBeDefined();
      expect(headerBlock.text.text).toContain('New Testimonial Received!');

      const contentBlock = payload.blocks.find((b: any) => b.type === 'section');
      expect(contentBlock.text.text).toContain('⭐⭐⭐⭐⭐');
      expect(contentBlock.text.text).toContain('Sarah Jenkins');
      expect(contentBlock.text.text).toContain('HyperGrowth');
      expect(contentBlock.text.text).toContain('increased our landing page conversion');

      const actionBlock = payload.blocks.find((b: any) => b.type === 'actions');
      expect(actionBlock).toBeDefined();
      const button = actionBlock.elements[0];
      expect(button.url).toContain('growth-studio');
    });
  });

  describe('formatDiscordTestimonialPayload', () => {
    it('creates a formatted Discord rich embed with rating, quote, and branding', () => {
      const payload = formatDiscordTestimonialPayload(sampleReview, 'https://pandapraise.com');
      expect(payload.embeds).toBeDefined();
      expect(payload.embeds.length).toBe(1);

      const embed = payload.embeds[0];
      expect(embed.title).toContain('New 5-Star Testimonial');
      expect(embed.description).toContain('PandaPraise increased our landing page');
      expect(embed.fields).toBeDefined();
      const ratingField = embed.fields.find((f: any) => f.name === 'Rating');
      expect(ratingField.value).toBe('⭐⭐⭐⭐⭐ (5/5)');
      expect(embed.footer.text).toBe('PandaPraise Distribution Engine');
    });
  });

  describe('formatGenericWebhookPayload', () => {
    it('creates standard REST hook payload for Zapier/Make with event type and metadata', () => {
      const payload = formatGenericWebhookPayload('testimonial.created', sampleReview);
      expect(payload.event).toBe('testimonial.created');
      expect(payload.timestamp).toBeDefined();
      expect(payload.data.id).toBe('rev_123');
      expect(payload.data.rating).toBe(5);
      expect(payload.data.authorName).toBe('Sarah Jenkins');
    });
  });

  describe('dispatchSlackAlert', () => {
    it('sends POST request to Slack Webhook URL with JSON payload', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
      globalThis.fetch = mockFetch;

      const result = await dispatchSlackAlert('https://hooks.slack.com/services/TEST/SLACK/URL', sampleReview, 'https://pandapraise.com');
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/TEST/SLACK/URL',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('returns error when Slack returns non-200 response', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('invalid_token', { status: 403 }));
      globalThis.fetch = mockFetch;

      const result = await dispatchSlackAlert('https://hooks.slack.com/services/TEST/SLACK/URL', sampleReview, 'https://pandapraise.com');
      expect(result.success).toBe(false);
      expect(result.error).toContain('403');
    });
  });

  describe('handleWebhookTestDispatch', () => {
    const mockEnv: WorkerEnv = {} as any;

    it('validates required targetUrl and platform', async () => {
      const req = new Request('https://pandapraise.com/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await handleWebhookTestDispatch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Missing targetUrl or platform');
    });

    it('dispatches test ping to Slack and returns 200 ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
      globalThis.fetch = mockFetch;

      const req = new Request('https://pandapraise.com/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'slack',
          targetUrl: 'https://hooks.slack.com/services/T00/B00/X00',
        }),
      });

      const res = await handleWebhookTestDispatch(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Test alert successfully sent to slack');
    });
  });
});
