import { describe, it, expect } from 'vitest';
import { handleReviewInviteWebhook } from './reviewInviteWebhook';

describe('Review Invite Inbound Webhook Handler', () => {
  const dummyEnv: any = {};

  it('rejects GET requests with 405 Method Not Allowed', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/review-invite', {
      method: 'GET',
    });
    const res = await handleReviewInviteWebhook(req, dummyEnv);
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.error).toContain('Method not allowed');
  });

  it('rejects invalid JSON with 400 Bad Request', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/review-invite', {
      method: 'POST',
      body: 'invalid-json-body',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleReviewInviteWebhook(req, dummyEnv);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid JSON');
  });

  it('rejects missing customer email with 400 Bad Request and error message', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/review-invite', {
      method: 'POST',
      body: JSON.stringify({ customerName: 'Alex Rivera' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleReviewInviteWebhook(req, dummyEnv);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing or invalid customerEmail');
  });

  it('accepts valid customer payload and returns customized review invitation URL', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/review-invite', {
      method: 'POST',
      body: JSON.stringify({
        customerEmail: 'alex.rivera@example.com',
        customerName: 'Alex Rivera',
        spaceSlug: 'acme-saas',
        triggerSource: 'stripe_checkout',
        orderId: 'ch_12345',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleReviewInviteWebhook(req, dummyEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.inviteUrl).toContain('/c/acme-saas?');
    expect(data.inviteUrl).toContain('email=alex.rivera%40example.com');
    expect(data.inviteUrl).toContain('name=Alex+Rivera');
    expect(data.customer.email).toBe('alex.rivera@example.com');
    expect(data.customer.orderId).toBe('ch_12345');
  });

  it('defaults spaceSlug to feedback if omitted', async () => {
    const req = new Request('https://pandapraise.com/api/webhook/review-invite', {
      method: 'POST',
      body: JSON.stringify({
        email: 'diner@cafebakery.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleReviewInviteWebhook(req, dummyEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.inviteUrl).toContain('/c/feedback?email=diner%40cafebakery.com');
  });
});
