import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAdminGetWorkspaces, handleAdminUpdateWorkspacePlan, isAuthorizedAdmin } from './admin';
import { WorkerEnv } from '../types';

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((authHeader) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    return parts[1] || null;
  }),
  verifyFirebaseToken: vi.fn(),
}));

vi.mock('../lib/firestoreAdmin', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json', Authorization: 'Bearer mock_sa' }),
  saveDocument: vi.fn().mockResolvedValue(undefined),
  fromFirestoreFields: vi.fn((fields) => {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields as Record<string, any>)) {
      res[k] = v.stringValue || v.booleanValue || v;
    }
    return res;
  }),
}));

import { verifyFirebaseToken } from '../lib/firebaseAuth';
import { saveDocument } from '../lib/firestoreAdmin';

describe('Admin Handler & Security', () => {
  let env: WorkerEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    env = {
      ASSETS: { fetch: vi.fn() },
      FIREBASE_API_KEY: 'test-api-key',
      ADMIN_EMAILS: 'custom_admin@example.com,ops@pandapraise.com',
    };
  });

  describe('isAuthorizedAdmin', () => {
    it('recognizes default and custom admin emails', () => {
      expect(isAuthorizedAdmin('hello@pandapraise.com', env)).toBe(true);
      expect(isAuthorizedAdmin('admin@pandapraise.com', env)).toBe(true);
      expect(isAuthorizedAdmin('founder@pandapraise.com', env)).toBe(true);
      expect(isAuthorizedAdmin('CUSTOM_ADMIN@example.com ', env)).toBe(true);
      expect(isAuthorizedAdmin('ops@pandapraise.com', env)).toBe(true);
      expect(isAuthorizedAdmin('regular_user@example.com', env)).toBe(false);
      expect(isAuthorizedAdmin(null, env)).toBe(false);
      expect(isAuthorizedAdmin(undefined, env)).toBe(false);
    });
  });

  describe('GET /api/admin/workspaces', () => {
    it('returns 405 for non-GET methods', async () => {
      const req = new Request('https://pandapraise.com/api/admin/workspaces', { method: 'POST' });
      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(405);
    });

    it('returns 401 when no token is provided', async () => {
      const req = new Request('https://pandapraise.com/api/admin/workspaces', { method: 'GET' });
      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(401);
    });

    it('returns 403 when token belongs to non-admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_123',
        email: 'regular@example.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid_token' },
      });
      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(403);
    });

    it('returns 200 with sorted workspaces when token belongs to superadmin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_123',
        email: 'admin@pandapraise.com',
      });

      const mockFirestoreResponse = [
        {
          document: {
            name: 'projects/proj/databases/(default)/documents/workspaces/ws_1',
            fields: {
              name: { stringValue: 'Alpha Corp' },
              plan: { stringValue: 'free' },
              createdAt: { stringValue: '2026-01-01T00:00:00Z' },
            },
          },
        },
        {
          document: {
            name: 'projects/proj/databases/(default)/documents/workspaces/ws_2',
            fields: {
              name: { stringValue: 'Beta Brand' },
              plan: { stringValue: 'pro' },
              createdAt: { stringValue: '2026-05-01T00:00:00Z' },
            },
          },
        },
      ];

      // Mock global fetch for firestore REST query
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify(mockFirestoreResponse), { status: 200 })
      );

      try {
        const req = new Request('https://pandapraise.com/api/admin/workspaces', {
          method: 'GET',
          headers: { Authorization: 'Bearer admin_token' },
        });
        const res = await handleAdminGetWorkspaces(req, env);
        expect(res.status).toBe(200);

        const data: any = await res.json();
        expect(data.workspaces).toHaveLength(2);
        // Sorted desc by date: ws_2 should come first
        expect(data.workspaces[0].id).toBe('ws_2');
        expect(data.workspaces[1].id).toBe('ws_1');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('POST /api/admin/workspaces/:id/plan', () => {
    it('returns 403 when caller is not admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_123',
        email: 'hacker@example.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_1/plan', {
        method: 'POST',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const res = await handleAdminUpdateWorkspacePlan(req, env, 'ws_1');
      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid plan name', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'founder@pandapraise.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_1/plan', {
        method: 'POST',
        headers: { Authorization: 'Bearer admin_token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'unlimited_super_hax' }),
      });
      const res = await handleAdminUpdateWorkspacePlan(req, env, 'ws_1');
      expect(res.status).toBe(400);
    });

    it('updates plan to founding_lifetime successfully', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'founder@pandapraise.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_target/plan', {
        method: 'POST',
        headers: { Authorization: 'Bearer admin_token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'founding_lifetime' }),
      });
      const res = await handleAdminUpdateWorkspacePlan(req, env, 'ws_target');
      expect(res.status).toBe(200);

      const body: any = await res.json();
      expect(body.success).toBe(true);
      expect(body.plan).toBe('founding_lifetime');
      expect(body.billingCycle).toBe('lifetime');

      expect(saveDocument).toHaveBeenCalledWith(
        'workspaces',
        'ws_target',
        expect.objectContaining({
          plan: 'founding_lifetime',
          billingCycle: 'lifetime',
          subscriptionStatus: 'active',
        }),
        null,
        env
      );
    });
  });
});
