import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePublicApi, generateOpenApiSpec } from './publicApiHandler';
import { WorkerEnv } from '../types';

describe('Public REST API & Developer Keys (Task 3.5)', () => {
  const mockEnv: WorkerEnv = {} as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOpenApiSpec', () => {
    it('returns a valid OpenAPI 3.0.3 document with testimonials and widgets schemas', () => {
      const spec = generateOpenApiSpec('https://pandapraise.com');
      expect(spec.openapi).toBe('3.0.3');
      expect(spec.info.title).toContain('PandaPraise Public REST API');
      expect(spec.paths['/api/v1/testimonials']).toBeDefined();
      expect(spec.paths['/api/v1/widgets']).toBeDefined();
      expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
    });
  });

  describe('handlePublicApi - Authentication', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      const req = new Request('https://pandapraise.com/api/v1/testimonials', {
        method: 'GET',
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized: Missing or invalid API key');
    });

    it('accepts requests with valid Bearer token', async () => {
      const req = new Request('https://pandapraise.com/api/v1/testimonials?space=demo', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer pp_live_test_key_123',
        },
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('accepts requests with X-Api-Key header', async () => {
      const req = new Request('https://pandapraise.com/api/v1/testimonials?space=demo', {
        method: 'GET',
        headers: {
          'X-Api-Key': 'pp_live_test_key_123',
        },
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
    });
  });

  describe('handlePublicApi - GET /api/v1/openapi.json', () => {
    it('serves OpenAPI spec without requiring authentication', async () => {
      const req = new Request('https://pandapraise.com/api/v1/openapi.json', {
        method: 'GET',
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const spec = await res.json();
      expect(spec.openapi).toBe('3.0.3');
    });
  });

  describe('handlePublicApi - POST /api/v1/testimonials', () => {
    it('validates required fields for creating a testimonial', async () => {
      const req = new Request('https://pandapraise.com/api/v1/testimonials', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pp_live_test_key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: 5,
        }),
      });

      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('authorName and text are required');
    });

    it('creates a new testimonial with valid payload', async () => {
      const req = new Request('https://pandapraise.com/api/v1/testimonials', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pp_live_test_key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName: 'David Kim',
          authorCompany: 'Acme SaaS',
          authorEmail: 'david@acme.com',
          rating: 5,
          text: 'PandaPraise makes collecting testimonials completely effortless. 10/10.',
          spaceSlug: 'acme-testimonials',
        }),
      });

      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.testimonial.id).toMatch(/^api_/);
      expect(data.testimonial.authorName).toBe('David Kim');
      expect(data.testimonial.status).toBe('approved');
    });
  });

  describe('handlePublicApi - GET /api/v1/widgets', () => {
    it('returns widget configurations and copyable embed scripts', async () => {
      const req = new Request('https://pandapraise.com/api/v1/widgets?space=acme', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer pp_live_test_key',
        },
      });

      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.widgets).toBeDefined();
      expect(data.widgets.length).toBeGreaterThan(0);
      expect(data.widgets[0].embedScript).toContain('pandapraise.com/embed.js');
    });
  });

  describe('handlePublicApi - Tier Enforcement Endpoints', () => {
    it('GET /api/v1/resolve-domain rejects starter plan domains with 403', async () => {
      const req = new Request('https://pandapraise.com/api/v1/resolve-domain?host=starter-brand.com', {
        method: 'GET',
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Custom domain requires Pro or Agency plan');
    });

    it('GET /api/v1/resolve-domain accepts pro plan domains', async () => {
      const req = new Request('https://pandapraise.com/api/v1/resolve-domain?host=pro-brand.com', {
        method: 'GET',
      });
      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.workspace).toBeDefined();
      expect(data.workspace.plan).toBe('pro');
    });

    it('POST /api/v1/testimonials/submit runs AI sentiment and detects spam patterns', async () => {
      const spamReq = new Request('https://pandapraise.com/api/v1/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'ws_pro_123',
          author_name: 'Spammer',
          content: 'Free crypto bonus at http://spam.xyz/casino',
        }),
      });

      const spamRes = await handlePublicApi(spamReq, mockEnv);
      expect(spamRes.status).toBe(200);
      const spamData = await spamRes.json();
      expect(spamData.ai_shield.is_spam).toBe(true);
      expect(spamData.testimonial.status).toBe('rejected');

      const legitReq = new Request('https://pandapraise.com/api/v1/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'ws_pro_123',
          author_name: 'Priya Sharma',
          content: 'I love this product, it is the best and super fast!',
        }),
      });

      const legitRes = await handlePublicApi(legitReq, mockEnv);
      expect(legitRes.status).toBe(200);
      const legitData = await legitRes.json();
      expect(legitData.ai_shield.is_spam).toBe(false);
      expect(legitData.ai_shield.sentiment_label).toBe('positive');
      expect(legitData.testimonial.status).toBe('pending');
    });

    it('POST /api/v1/drips/dispatch enforces Pro or Agency tier', async () => {
      const req = new Request('https://pandapraise.com/api/v1/drips/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'ws_test_1',
          customer_name: 'Aarav Mehta',
          customer_email: 'aarav@example.com',
          channel: 'email',
          collection_link: 'https://pandapraise.com/c/demo',
        }),
      });

      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('sent');
    });

    it('POST /api/v1/clipper/capture captures WhatsApp reviews for Pro workspaces', async () => {
      const req = new Request('https://pandapraise.com/api/v1/clipper/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PandaPraise-Key': 'pp_live_valid_key',
        },
        body: JSON.stringify({
          author_name: 'Raj Patel',
          message_text: 'Thank you for the quick turnaround!',
          source_platform: 'WhatsApp Web',
        }),
      });

      const res = await handlePublicApi(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.clipped).toBe(true);
      expect(data.data.author_role).toContain('Verified via WhatsApp Web');
    });
  });
});
