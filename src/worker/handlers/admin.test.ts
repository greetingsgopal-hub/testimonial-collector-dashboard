import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleAdminGetWorkspaces,
  handleAdminUpdateWorkspacePlan,
  handleAdminGetOverview,
  handleAdminGetUsers,
  handleAdminGetUsage,
  handleAdminGetHealth,
  handleAdminGetEvents,
  handleAdminSuspendUser,
  handleAdminReactivateUser,
  isAuthorizedAdmin,
} from './admin';
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
      expect(isAuthorizedAdmin('hello@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('admin@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('founder@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('greetings.gopal@gmail.com', env)).toBe(true);
      expect(isAuthorizedAdmin('greetingsgopal@gmail.com', env)).toBe(true);
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
        email: 'greetings.gopal@gmail.com',
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
        email: 'greetings.gopal@gmail.com',
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
        email: 'greetings.gopal@gmail.com',
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
        expect.anything(),
        env
      );
    });
  });

  describe('GET /api/admin/overview', () => {
    it('returns 401 when unauthenticated', async () => {
      const req = new Request('https://pandapraise.com/api/admin/overview', { method: 'GET' });
      const res = await handleAdminGetOverview(req, env);
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_123',
        email: 'regular@example.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/overview', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid_token' },
      });
      const res = await handleAdminGetOverview(req, env);
      expect(res.status).toBe(403);
    });

    it('returns verified business overview metrics for superadmin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });

      const now = new Date();
      const mockWorkspaces = [
        {
          document: {
            name: 'projects/p/databases/(default)/documents/workspaces/ws1',
            fields: {
              name: { stringValue: 'Workspace One' },
              ownerId: { stringValue: 'user_a' },
              owner_email: { stringValue: 'user_a@example.com' },
              plan: { stringValue: 'free' },
              createdAt: { stringValue: now.toISOString() },
            },
          },
        },
        {
          document: {
            name: 'projects/p/databases/(default)/documents/workspaces/ws2',
            fields: {
              name: { stringValue: 'Workspace Two' },
              ownerId: { stringValue: 'user_b' },
              owner_email: { stringValue: 'user_b@example.com' },
              plan: { stringValue: 'pro' },
              createdAt: { stringValue: now.toISOString() },
            },
          },
        },
      ];

      const mockPayments = [
        {
          document: {
            name: 'projects/p/databases/(default)/documents/payments/pay1',
            fields: {
              amount: { integerValue: '2499' },
              status: { stringValue: 'Paid' },
              currency: { stringValue: 'INR' },
              createdAt: { stringValue: now.toISOString() },
            },
          },
        },
        {
          document: {
            name: 'projects/p/databases/(default)/documents/payments/pay2',
            fields: {
              amount: { integerValue: '2499' },
              status: { stringValue: 'Failed' },
              currency: { stringValue: 'INR' },
              createdAt: { stringValue: now.toISOString() },
            },
          },
        },
      ];

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('workspaces') || url.includes('runQuery')) {
          // Check call count or body to distinguish
          return Promise.resolve(new Response(JSON.stringify(mockWorkspaces), { status: 200 }));
        }
        return Promise.resolve(new Response(JSON.stringify(mockPayments), { status: 200 }));
      });

      try {
        const req = new Request('https://pandapraise.com/api/admin/overview', {
          method: 'GET',
          headers: { Authorization: 'Bearer admin_token' },
        });
        const res = await handleAdminGetOverview(req, env);
        expect(res.status).toBe(200);

        const data: any = await res.json();
        expect(data).toHaveProperty('totalWorkspaces');
        expect(data).toHaveProperty('freeWorkspaces');
        expect(data).toHaveProperty('paidWorkspaces');
        expect(data).toHaveProperty('revenue');
        expect(data).toHaveProperty('failedPayments');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('GET /api/admin/users', () => {
    it('returns 403 for non-admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_abc',
        email: 'user@example.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/users', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });
      const res = await handleAdminGetUsers(req, env);
      expect(res.status).toBe(403);
    });

    it('returns filtered users when query param is passed', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });

      const mockWorkspaces = [
        {
          document: {
            name: 'projects/p/databases/(default)/documents/workspaces/ws1',
            fields: {
              name: { stringValue: 'Acme Studio' },
              owner_email: { stringValue: 'acme@test.com' },
              plan: { stringValue: 'pro' },
              status: { stringValue: 'active' },
            },
          },
        },
        {
          document: {
            name: 'projects/p/databases/(default)/documents/workspaces/ws2',
            fields: {
              name: { stringValue: 'Beta Labs' },
              owner_email: { stringValue: 'beta@test.com' },
              plan: { stringValue: 'free' },
              status: { stringValue: 'active' },
            },
          },
        },
      ];

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockWorkspaces), { status: 200 })
      );

      try {
        const req = new Request('https://pandapraise.com/api/admin/users?q=acme', {
          method: 'GET',
          headers: { Authorization: 'Bearer admin_token' },
        });
        const res = await handleAdminGetUsers(req, env);
        expect(res.status).toBe(200);
        const data: any = await res.json();
        expect(data.users).toHaveLength(1);
        expect(data.users[0].owner_email).toBe('acme@test.com');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('GET /api/admin/usage', () => {
    it('returns 403 for non-admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_1',
        email: 'user@example.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/usage', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await handleAdminGetUsage(req, env);
      expect(res.status).toBe(403);
    });

    it('returns product usage statistics for superadmin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });
      const mockReviews = [
        {
          document: {
            name: 'projects/p/databases/(default)/documents/public_reviews/rev1',
            fields: {
              status: { stringValue: 'approved' },
              rating: { integerValue: '5' },
            },
          },
        },
        {
          document: {
            name: 'projects/p/databases/(default)/documents/public_reviews/rev2',
            fields: {
              status: { stringValue: 'flagged_spam' },
              rating: { integerValue: '1' },
            },
          },
        },
      ];

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify(mockReviews), { status: 200 })
      );

      try {
        const req = new Request('https://pandapraise.com/api/admin/usage', {
          headers: { Authorization: 'Bearer token' },
        });
        const res = await handleAdminGetUsage(req, env);
        expect(res.status).toBe(200);
        const data: any = await res.json();
        expect(data.usage.totalReviews).toBe(2);
        expect(data.usage.approvedReviews).toBe(1);
        expect(data.usage.flaggedReviews).toBe(1);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('GET /api/admin/events', () => {
    it('returns 403 for non-admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_1',
        email: 'user@example.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/events', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await handleAdminGetEvents(req, env);
      expect(res.status).toBe(403);
    });

    it('returns audit log and payment events for superadmin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });

      const mockLogs = [
        {
          document: {
            name: 'projects/p/databases/(default)/documents/admin_audit_logs/l1',
            fields: {
              action: { stringValue: 'workspace_suspended' },
              adminEmail: { stringValue: 'greetings.gopal@gmail.com' },
              timestamp: { stringValue: '2026-10-17T12:00:00Z' },
            },
          },
        },
      ];

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(mockLogs), { status: 200 }))
      );

      try {
        const req = new Request('https://pandapraise.com/api/admin/events', {
          headers: { Authorization: 'Bearer token' },
        });
        const res = await handleAdminGetEvents(req, env);
        expect(res.status).toBe(200);
        const data: any = await res.json();
        expect(Array.isArray(data.events)).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('GET /api/admin/health', () => {
    it('returns 403 for non-admin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_1',
        email: 'user@example.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/health', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await handleAdminGetHealth(req, env);
      expect(res.status).toBe(403);
    });

    it('returns operational health metrics for superadmin', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });
      const req = new Request('https://pandapraise.com/api/admin/health', {
        headers: { Authorization: 'Bearer admin_token' },
      });
      const res = await handleAdminGetHealth(req, env);
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data).toHaveProperty('runtime');
      expect(data).toHaveProperty('database');
      expect(data).toHaveProperty('gateways');
    });
  });

  describe('POST /api/admin/workspaces/:id/suspend & reactivate', () => {
    it('suspends workspace and writes audit log', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_target/suspend', {
        method: 'POST',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Terms of service violation' }),
      });
      const res = await handleAdminSuspendUser(req, env, 'ws_target');
      expect(res.status).toBe(200);

      // Verify workspace status updated
      expect(saveDocument).toHaveBeenCalledWith(
        'workspaces',
        'ws_target',
        expect.objectContaining({
          status: 'suspended',
          suspendedBy: 'greetings.gopal@gmail.com',
        }),
        expect.anything(),
        env
      );

      // Verify audit log recorded
      expect(saveDocument).toHaveBeenCalledWith(
        'admin_audit_logs',
        expect.any(String),
        expect.objectContaining({
          action: 'workspace_suspended',
          targetId: 'ws_target',
          adminEmail: 'greetings.gopal@gmail.com',
        }),
        expect.anything(),
        env
      );
    });

    it('reactivates workspace and writes audit log', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'admin_1',
        email: 'greetings.gopal@gmail.com',
      });

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_target/reactivate', {
        method: 'POST',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Issue resolved by customer support' }),
      });
      const res = await handleAdminReactivateUser(req, env, 'ws_target');
      expect(res.status).toBe(200);

      expect(saveDocument).toHaveBeenCalledWith(
        'workspaces',
        'ws_target',
        expect.objectContaining({
          status: 'active',
          reactivatedBy: 'greetings.gopal@gmail.com',
        }),
        expect.anything(),
        env
      );

      expect(saveDocument).toHaveBeenCalledWith(
        'admin_audit_logs',
        expect.any(String),
        expect.objectContaining({
          action: 'workspace_reactivated',
          targetId: 'ws_target',
        }),
        expect.anything(),
        env
      );
    });
  });
});
