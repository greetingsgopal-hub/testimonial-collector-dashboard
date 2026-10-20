import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleContactSubmit } from './contactHandler';
import { WorkerEnv } from '../types';

vi.mock('../lib/firestoreAdmin', () => ({
  saveDocument: vi.fn().mockResolvedValue(undefined),
}));

import { saveDocument } from '../lib/firestoreAdmin';

describe('Contact Handler: POST /api/contact', () => {
  let mockKV: any;
  let env: WorkerEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    mockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };
    env = {
      RATE_LIMIT_KV: mockKV,
      FIREBASE_PROJECT_ID: 'test-project',
      NODE_ENV: 'test',
    } as any;
  });

  it('rejects non-POST requests with 405', async () => {
    const req = new Request('https://pandapraise.com/api/contact', { method: 'GET' });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(405);
  });

  it('rejects missing or empty name with 400', async () => {
    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', message: 'Hello, need help with widgets.' }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Name is required');
  });

  it('rejects invalid or disposable emails with 400', async () => {
    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Spam Bot', email: 'spammer@mailinator.com', message: 'Hello, need help.' }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('permanent work or personal email');
  });

  it('rejects short messages (< 10 chars) with 400', async () => {
    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com', message: 'Hi' }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('between 10 and 3,000 characters');
  });

  it('rejects repetitive character spam with 400', async () => {
    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com', message: 'Help me aaaaaaaaaaa' }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('repetitive spam characters');
  });

  it('persists valid inquiries to contact_inquiries and returns 200', async () => {
    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.1' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@company.com',
        subject: 'support',
        message: 'Could you please advise on how to customize the border radius on Wall of Love widgets?',
      }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.inquiryId).toBeDefined();
    expect(saveDocument).toHaveBeenCalledTimes(1);
    expect((saveDocument as any).mock.calls[0][0]).toBe('contact_inquiries');
    expect((saveDocument as any).mock.calls[0][2].email).toBe('jane@company.com');
  });

  it('enforces rate limiting when limit exceeded', async () => {
    const windowStart = Math.floor(Date.now() / 600000) * 600000;
    mockKV.get.mockResolvedValue(JSON.stringify({ count: 5, windowStart }));

    const req = new Request('https://pandapraise.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.1' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@company.com',
        message: 'Another inquiry here...',
      }),
    });
    const res = await handleContactSubmit(req, env);
    expect(res.status).toBe(429);
  });
});
