import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePublicTestimonialSubmit, verifyTurnstileToken } from './publicSubmissionHandler';
import { WorkerEnv, KVNamespaceLike } from '../types';

vi.mock('../lib/firestoreAdmin', () => ({
  getDocument: vi.fn(),
  queryUserDocuments: vi.fn(),
  saveDocument: vi.fn(),
}));

import { getDocument, queryUserDocuments, saveDocument } from '../lib/firestoreAdmin';

describe('Public Testimonial Submission Handler (Turnstile + Rate Limiting + Free Tier Limits)', () => {
  let env: WorkerEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    env = {
      ASSETS: { fetch: vi.fn() },
      TURNSTILE_SECRET_KEY: '0x4AAAAAAATestSecretKey',
      FIREBASE_PROJECT_ID: 'test-project',
    };
  });

  it('rejects non-POST HTTP methods with 405', async () => {
    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'GET',
    });
    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(405);
  });

  it('enforces IP rate limiting after 5 requests from the same IP (memory fallback)', async () => {
    const ip = '203.0.113.42';
    vi.mocked(getDocument).mockResolvedValue({
      id: 'form-123',
      ownerId: 'owner-1',
      projectId: 'proj-1',
      isActive: true,
    });
    vi.mocked(queryUserDocuments).mockResolvedValue([]);
    vi.mocked(saveDocument).mockResolvedValue(undefined);

    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    );

    const makeReq = () =>
      new Request('https://pandapraise.com/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': ip,
        },
        body: JSON.stringify({
          collectionFormId: 'form-123',
          name: 'Jane Doe',
          content: 'This product changed the way our team gathers customer trust!',
          rating: 5,
          consent: true,
          turnstileToken: 'test-token',
        }),
      });

    for (let i = 0; i < 5; i++) {
      const res = await handlePublicTestimonialSubmit(makeReq(), env);
      expect(res.status).toBe(201);
    }

    const blockedRes = await handlePublicTestimonialSubmit(makeReq(), env);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('Retry-After')).toBeTruthy();
    const data = await blockedRes.json();
    expect(data.error).toContain('Too many submissions');
  });

  it('enforces rate limiting via Cloudflare KV when RATE_LIMIT_KV is bound', async () => {
    const kvStore = new Map<string, string>();
    const mockKV: KVNamespaceLike = {
      get: vi.fn(async (key: string) => kvStore.get(key) || null),
      put: vi.fn(async (key: string, val: string) => { kvStore.set(key, val); }),
      delete: vi.fn(async (key: string) => { kvStore.delete(key); }),
    };

    env.RATE_LIMIT_KV = mockKV;
    const ip = '198.51.100.99';

    vi.mocked(getDocument).mockResolvedValue({
      id: 'form-kv',
      ownerId: 'owner-kv',
      projectId: 'proj-kv',
      isActive: true,
    });
    vi.mocked(queryUserDocuments).mockResolvedValue([]);
    vi.mocked(saveDocument).mockResolvedValue(undefined);

    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    );

    const makeReq = () =>
      new Request('https://pandapraise.com/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': ip,
        },
        body: JSON.stringify({
          collectionFormId: 'form-kv',
          name: 'KV User',
          content: 'Testing rate limits across Cloudflare edge nodes with KV.',
          rating: 5,
          consent: true,
          turnstileToken: 'test-token',
        }),
      });

    for (let i = 0; i < 5; i++) {
      const res = await handlePublicTestimonialSubmit(makeReq(), env);
      expect(res.status).toBe(201);
    }
    expect(mockKV.put).toHaveBeenCalled();

    const blocked = await handlePublicTestimonialSubmit(makeReq(), env);
    expect(blocked.status).toBe(429);
  });

  it('fails closed with 503 when KV encounters an unhandled exception', async () => {
    const errorKV: KVNamespaceLike = {
      get: vi.fn().mockRejectedValue(new Error('Cloudflare KV cluster unreachable')),
      put: vi.fn(),
      delete: vi.fn(),
    };
    env.RATE_LIMIT_KV = errorKV;

    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.100',
      },
      body: JSON.stringify({
        collectionFormId: 'form-123',
        name: 'Jane Doe',
        content: 'Testing rate limit KV outage fail-closed handling.',
        rating: 5,
        consent: true,
        turnstileToken: 'test-token',
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain('Rate limit service unavailable');
  });

  it('fails closed in production with 503 if TURNSTILE_SECRET_KEY is missing', async () => {
    env.NODE_ENV = 'production';
    delete env.TURNSTILE_SECRET_KEY;

    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.101',
      },
      body: JSON.stringify({
        collectionFormId: 'form-123',
        name: 'Jane Doe',
        content: 'Testing production turnstile unconfigured behavior.',
        rating: 5,
        consent: true,
        turnstileToken: 'test-token',
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain('Security verification service is unconfigured');
  });

  it('rejects missing Turnstile CAPTCHA token when TURNSTILE_SECRET_KEY is configured', async () => {
    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.1',
      },
      body: JSON.stringify({
        collectionFormId: 'form-123',
        name: 'Jane Doe',
        content: 'Great app! Highly recommended for all SaaS founders.',
        rating: 5,
        consent: true,
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('missing CAPTCHA token');
  });

  it('rejects invalid Turnstile token when verification endpoint fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), {
          status: 200,
        })
      )
    );

    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.2',
      },
      body: JSON.stringify({
        collectionFormId: 'form-123',
        name: 'Bot Spammer',
        content: 'Spamming thousands of fake links and SEO content here...',
        rating: 5,
        consent: true,
        turnstileToken: 'fake-invalid-token',
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('CAPTCHA verification failed');
  });

  it('rejects submission when collection form is inactive or closed', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    );

    vi.mocked(getDocument).mockResolvedValue({
      id: 'form-closed',
      ownerId: 'owner-1',
      isActive: false, // Closed form
    });

    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.3',
      },
      body: JSON.stringify({
        collectionFormId: 'form-closed',
        name: 'Real User',
        content: 'I love this tool, it is simply incredible and fast!',
        rating: 5,
        consent: true,
        turnstileToken: 'valid-token',
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('inactive or closed');
  });

  it('enforces server-side free plan limit of 15 reviews', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    );

    vi.mocked(getDocument).mockResolvedValue({
      id: 'form-free',
      ownerId: 'owner-free-tier',
      projectId: 'proj-1',
      isActive: true,
    });

    vi.mocked(queryUserDocuments).mockImplementation(async (collection: string) => {
      if (collection === 'workspaces') {
        return [{ id: 'ws-free', plan: 'free', ownerId: 'owner-free-tier' }];
      }
      if (collection === 'reviews') {
        return Array(15).fill({ id: 'existing-rev' });
      }
      return [];
    });

    const req = new Request('https://pandapraise.com/api/testimonials/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.4',
      },
      body: JSON.stringify({
        collectionFormId: 'form-free',
        name: 'Customer 16',
        content: 'Sixteenth customer review trying to be submitted.',
        rating: 5,
        consent: true,
        turnstileToken: 'valid-token',
      }),
    });

    const res = await handlePublicTestimonialSubmit(req, env);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('free tier limit of 15 testimonials');
  });
});
