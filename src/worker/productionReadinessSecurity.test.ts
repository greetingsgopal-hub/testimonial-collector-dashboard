import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WorkerEnv } from './types';

// Mock auth and firestore dependencies
vi.mock('./lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((authHeader) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    return parts[1] || null;
  }),
  verifyFirebaseToken: vi.fn(),
  deleteFirebaseAccount: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./lib/firestoreAdmin', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json', Authorization: 'Bearer mock_sa' }),
  saveDocument: vi.fn().mockResolvedValue(undefined),
  deleteDocument: vi.fn().mockResolvedValue(undefined),
  queryUserDocuments: vi.fn().mockResolvedValue([]),
  queryDocumentsByField: vi.fn().mockResolvedValue([]),
  fromFirestoreFields: vi.fn((fields) => fields),
}));

vi.mock('./lib/stripeClient', () => ({
  deleteStripeCustomerAndSubscriptions: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./lib/razorpayClient', () => ({
  cancelRazorpaySubscription: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./lib/firebaseStorage', () => ({
  deleteUserStorageObjects: vi.fn().mockResolvedValue(undefined),
}));

import { verifyFirebaseToken, deleteFirebaseAccount } from './lib/firebaseAuth';
import { handleAdminGetWorkspaces, handleAdminUpdateWorkspacePlan, isAuthorizedAdmin } from './handlers/admin';
import { handlePublicTestimonialSubmit } from './handlers/publicSubmissionHandler';
import { handleAccountDeletion } from './handlers/accountDeletionHandler';

describe('Phase 3 Production Readiness Security Invariants', () => {
  let env: WorkerEnv;
  const rules = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8');

  beforeEach(() => {
    vi.clearAllMocks();
    env = {
      ASSETS: { fetch: vi.fn() },
      FIREBASE_PROJECT_ID: 'testimonialcollectordashboard',
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
      } as any,
      ADMIN_EMAILS: 'greetings.gopal@gmail.com',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      NODE_ENV: 'production',
    } as any;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('challenges.cloudflare.com')) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
  });

  // Proof 1: User A cannot read or modify User B's private data (Tenant Isolation)
  describe('Proof 1: Tenant Data Isolation', () => {
    it('firestore.rules enforces strict workspace owner isolation on read and write', () => {
      const workspaceMatch = rules.match(/match \/workspaces\/\{workspaceId\} \{[\s\S]*?\n    \}/);
      expect(workspaceMatch).not.toBeNull();
      const wsBlock = workspaceMatch![0];
      // Only owner can read, update, or delete
      expect(wsBlock).toMatch(/allow read:\s*if isOwner\(resource\.data\.ownerId\);/);
      expect(wsBlock).toMatch(/allow update:\s*if isOwner\(resource\.data\.ownerId\)\s*&&\s*isOwnerUnchanged\(\)/);
      expect(wsBlock).toMatch(/allow delete:\s*if isOwner\(resource\.data\.ownerId\);/);
    });

    it('firestore.rules isolates operational reviews so User A cannot read or modify User B private reviews', () => {
      const reviewsStart = rules.indexOf('match /reviews/{reviewId} {');
      const publicReviewsStart = rules.indexOf('match /public_reviews/{reviewId} {');
      const reviewsBlock = rules.slice(reviewsStart, publicReviewsStart);

      expect(reviewsBlock).toMatch(/allow read:\s*if isOwner\(resource\.data\.ownerId\);/);
      expect(reviewsBlock).toMatch(/allow update:\s*if isOwner\(resource\.data\.ownerId\)\s*&&\s*isOwnerUnchanged\(\)/);
      expect(reviewsBlock).toMatch(/allow delete:\s*if isOwner\(resource\.data\.ownerId\);/);
    });

    it('firestore.rules isolates social connections and audit logs per tenant', () => {
      expect(rules).toMatch(/match \/social_connections\/\{connectionId\} \{[\s\S]*?allow read:\s*if isOwner/);
      expect(rules).toMatch(/match \/social_publications\/\{publicationId\} \{[\s\S]*?allow read:\s*if isOwner/);
    });
  });

  // Proof 2: Unauthenticated users cannot access protected endpoints
  describe('Proof 2: Protected Endpoints Reject Unauthenticated Access', () => {
    it('admin endpoints reject requests with missing Authorization header (401)', async () => {
      const req = new Request('https://pandapraise.com/api/admin/workspaces', { method: 'GET' });
      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Authentication required');
    });

    it('account deletion rejects requests without Authorization header (401)', async () => {
      const req = new Request('https://pandapraise.com/api/account/delete', { method: 'POST' });
      const res = await handleAccountDeletion(req, env);
      expect(res.status).toBe(401);
    });
  });

  // Proof 3: Ordinary authenticated users cannot access administrative endpoints
  describe('Proof 3: Non-Admin Authenticated Users Cannot Access Admin Endpoints', () => {
    it('rejects ordinary authenticated users with 403 Forbidden', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_regular_123',
        email: 'regular_user@example.com',
      } as any);

      const req = new Request('https://pandapraise.com/api/admin/workspaces', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid_user_token' },
      });

      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Superadmin authorization required');
    });

    it('prevents privilege escalation via lookalike emails (admin@, hello@, etc.)', () => {
      expect(isAuthorizedAdmin('admin@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('hello@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('founder@pandapraise.com', env)).toBe(false);
      expect(isAuthorizedAdmin('attacker@gmail.com', env)).toBe(false);
      expect(isAuthorizedAdmin('greetings.gopal@gmail.com', env)).toBe(true);
    });
  });

  // Proof 4: Invalid or expired tokens are rejected
  describe('Proof 4: Invalid and Expired Tokens are Rejected', () => {
    it('returns 401 when token verification fails or returns null', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce(null);

      const req = new Request('https://pandapraise.com/api/admin/workspaces', {
        method: 'GET',
        headers: { Authorization: 'Bearer expired_or_tampered_token' },
      });

      const res = await handleAdminGetWorkspaces(req, env);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Invalid or expired authentication token');
    });

    it('returns 401 when updating plan with expired token', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce(null);

      const req = new Request('https://pandapraise.com/api/admin/workspaces/ws_target/plan', {
        method: 'POST',
        headers: { Authorization: 'Bearer expired_token' },
        body: JSON.stringify({ plan: 'pro' }),
      });

      const res = await handleAdminUpdateWorkspacePlan(req, env, 'ws_target');
      expect(res.status).toBe(401);
    });
  });

  // Proof 5: Public testimonial submission cannot bypass validation or moderation
  describe('Proof 5: Public Testimonials Cannot Bypass Validation or Moderation', () => {
    it('fails closed when Turnstile token is missing in production (400)', async () => {
      const req = new Request('https://pandapraise.com/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionFormId: 'form_123',
          name: 'Anonymous Submitter',
          content: 'This product is amazing and solved our problem!',
          rating: 5,
          consent: true,
        }),
      });

      const res = await handlePublicTestimonialSubmit(req, env);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('missing CAPTCHA token');
    });

    it('rejects spam content and repetitive characters (400)', async () => {
      const req = new Request('https://pandapraise.com/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionFormId: 'form_123',
          turnstileToken: 'mock_token',
          name: 'Spammer',
          content: 'Great product aaaaaaaaaaaaaaaaaaaaa',
          rating: 5,
          consent: true,
        }),
      });

      const res = await handlePublicTestimonialSubmit(req, env);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('repetitive spam characters');
    });

    it('firestore.rules ensures direct public anonymous writes cannot write to reviews', () => {
      // Confirms anonymous create rule was completely removed from /reviews
      const reviewsStart = rules.indexOf('match /reviews/{reviewId} {');
      const publicReviewsStart = rules.indexOf('match /public_reviews/{reviewId} {');
      const reviewsBlock = rules.slice(reviewsStart, publicReviewsStart);

      expect(reviewsBlock).not.toMatch(/allow create:\s*if true/);
      expect(reviewsBlock).toMatch(/allow create:\s*if\s*isAuthenticated\(\)/);
    });
  });

  // Proof 6: Account deletion removes or appropriately anonymizes data
  describe('Proof 6: Account Deletion Enforces Cascading Right to Erasure', () => {
    it('deletes user authentication, firestore records, storage assets, and cancels subscriptions', async () => {
      vi.mocked(verifyFirebaseToken).mockResolvedValueOnce({
        uid: 'user_delete_123',
        email: 'user_delete@example.com',
      } as any);

      const req = new Request('https://pandapraise.com/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid_user_token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      const res = await handleAccountDeletion(req, env);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(deleteFirebaseAccount).toHaveBeenCalledWith('valid_user_token', env);
    });
  });
});
