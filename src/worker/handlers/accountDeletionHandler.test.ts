import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAccountDeletion } from './accountDeletionHandler';
import { WorkerEnv } from '../types';

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((authHeader) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    return parts[1] || null;
  }),
  verifyFirebaseToken: vi.fn(),
  deleteFirebaseAccount: vi.fn(),
}));

vi.mock('../lib/firestoreAdmin', () => ({
  queryUserDocuments: vi.fn(),
  queryDocumentsByField: vi.fn(),
  deleteDocument: vi.fn(),
}));

vi.mock('../lib/stripeClient', () => ({
  deleteStripeCustomerAndSubscriptions: vi.fn(),
}));

import { verifyFirebaseToken, deleteFirebaseAccount } from '../lib/firebaseAuth';
import { queryUserDocuments, queryDocumentsByField, deleteDocument } from '../lib/firestoreAdmin';
import { deleteStripeCustomerAndSubscriptions } from '../lib/stripeClient';

describe('GDPR Right to Erasure Account Deletion Handler', () => {
  let env: WorkerEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    env = {
      ASSETS: { fetch: vi.fn() },
      FIREBASE_API_KEY: 'test-api-key',
      STRIPE_SECRET_KEY: 'sk_test_123',
    };
  });

  it('rejects non-POST method with 405', async () => {
    const req = new Request('https://pandapraise.com/api/account/delete', { method: 'DELETE' });
    const res = await handleAccountDeletion(req, env);
    expect(res.status).toBe(405);
  });

  it('rejects missing Authorization header with 401', async () => {
    const req = new Request('https://pandapraise.com/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });

    const res = await handleAccountDeletion(req, env);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Authentication required');
  });

  it('rejects invalid or expired token with 401', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);

    const req = new Request('https://pandapraise.com/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token',
      },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });

    const res = await handleAccountDeletion(req, env);
    expect(res.status).toBe(401);
  });

  it('rejects missing or incorrect confirmation string with 400', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user-123', email: 'user@example.com' });

    const req = new Request('https://pandapraise.com/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({ confirmation: 'delete' }), // lowercase or wrong
    });

    const res = await handleAccountDeletion(req, env);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Explicit confirmation required');
  });

  it('executes full cascade purge across all tenant collections, Stripe, and Firebase Auth', async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: 'user-purge-456', email: 'purge@example.com' });

    vi.mocked(queryUserDocuments).mockImplementation(async (collection: string) => {
      if (collection === 'workspaces') {
        return [{ id: 'ws-1', ownerId: 'user-purge-456', stripeCustomerId: 'cus_stripe_123' }];
      }
      if (collection === 'projects') {
        return [{ id: 'proj-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'collection_forms') {
        return [{ id: 'form-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'reviews') {
        return [{ id: 'rev-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'public_reviews') {
        return [{ id: 'pub-rev-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'widgets') {
        return [{ id: 'widget-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'social_connections') {
        return [{ id: 'social-1', ownerId: 'user-purge-456' }];
      }
      if (collection === 'social_publications') {
        return [{ id: 'pub-log-1', ownerId: 'user-purge-456' }];
      }
      return [];
    });

    vi.mocked(queryDocumentsByField).mockResolvedValue([]);
    vi.mocked(deleteDocument).mockResolvedValue(undefined);
    vi.mocked(deleteStripeCustomerAndSubscriptions).mockResolvedValue(undefined);
    vi.mocked(deleteFirebaseAccount).mockResolvedValue(true);

    const req = new Request('https://pandapraise.com/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-id-token',
      },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });

    const res = await handleAccountDeletion(req, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify Stripe customer & subscription purge was invoked
    expect(deleteStripeCustomerAndSubscriptions).toHaveBeenCalledWith('cus_stripe_123', env);

    // Verify Firestore documents were deleted
    expect(deleteDocument).toHaveBeenCalledWith('workspaces', 'ws-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('projects', 'proj-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('collection_forms', 'form-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('reviews', 'rev-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('public_reviews', 'pub-rev-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('widgets', 'widget-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('social_connections', 'social-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('social_publications', 'pub-log-1', undefined, env);
    expect(deleteDocument).toHaveBeenCalledWith('users', 'user-purge-456', undefined, env);

    // Verify Firebase Auth account purge was invoked
    expect(deleteFirebaseAccount).toHaveBeenCalledWith('valid-id-token', env);
  });
});
