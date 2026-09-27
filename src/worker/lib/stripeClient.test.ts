import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression tests for getWorkspaceByCustomerId (final review, Medium #3).
 *
 * The lookup runs a Firestore REST runQuery against the workspaces
 * collection. Firestore rules require isOwner for workspaces reads, so an
 * unauthenticated query 403s and every subscription lifecycle webhook
 * (renewal, cancellation, payment failure) silently no-ops in production.
 *
 * The fix: attach the service-account access token (the same token every
 * other Worker Firestore call uses) as the Authorization header.
 *
 * These tests pin (1) the auth header is attached, (2) the lookup is only
 * reachable from the signature-verified webhook path — no user-facing
 * endpoint accepts a customer ID.
 */

vi.mock('./googleAuth', () => ({
  getServiceAccountAccessToken: vi.fn().mockResolvedValue('ya29.service-account-token'),
}));

vi.mock('./firestoreAdmin', () => ({
  getDocument: vi.fn(),
  saveDocument: vi.fn(),
}));

import { getWorkspaceByCustomerId } from './stripeClient';
import { getServiceAccountAccessToken } from './googleAuth';

const mockedSaToken = vi.mocked(getServiceAccountAccessToken);
const saToken = 'ya29.service-account-token';

const env = {
  FIREBASE_PROJECT_ID: 'test-project',
} as any;

function captureFetch(workspaceDoc: any | null) {
  const fetchCalls: Array<{ url: string; init: RequestInit }> = [];
  global.fetch = vi.fn().mockImplementation(async (url: any, init: any = {}) => {
    fetchCalls.push({ url: String(url), init });
    if (!workspaceDoc) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    return new Response(
      JSON.stringify([
        {
          document: {
            name: `projects/test-project/databases/(default)/documents/workspaces/${workspaceDoc.id}`,
            fields: {
              stripeCustomerId: { stringValue: workspaceDoc.stripeCustomerId },
              subscriptionStatus: { stringValue: workspaceDoc.subscriptionStatus },
            },
          },
        },
      ]),
      { status: 200 }
    );
  }) as any;
  return fetchCalls;
}

describe('getWorkspaceByCustomerId auth (final review Medium #3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSaToken.mockResolvedValue(saToken);
  });

  it('attaches the service-account Authorization header to the Firestore query', async () => {
    const calls = captureFetch({ id: 'ws_1', stripeCustomerId: 'cus_123', subscriptionStatus: 'active' });
    const result = await getWorkspaceByCustomerId('cus_123', env);

    expect(calls.length).toBe(1);
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe(`Bearer ${saToken}`);
    expect(result?.id).toBe('ws_1');
    expect(result?.data.stripeCustomerId).toBe('cus_123');
  });

  it('sends the query to the correct project collection', async () => {
    const calls = captureFetch(null);
    await getWorkspaceByCustomerId('cus_abc', env);
    expect(calls[0].url).toContain('projects/test-project/databases/(default)/documents:runQuery');
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.structuredQuery.from[0].collectionId).toBe('workspaces');
    expect(body.structuredQuery.where.fieldFilter.value.stringValue).toBe('cus_abc');
  });

  it('returns null (no throw) when the query fails — webhook logs and skips', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('forbidden', { status: 403 })) as any;
    const result = await getWorkspaceByCustomerId('cus_403', env);
    expect(result).toBeNull();
  });
});

describe('getWorkspaceByCustomerId reachability (authorization chain)', () => {
  const srcDir = join(process.cwd(), 'src');

  it('is only imported by the Stripe webhook handler (no user-facing route)', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry === 'node_modules' || entry === 'dist') continue;
          walk(full);
        } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
          files.push(full);
        }
      }
    };
    walk(srcDir);

    const importers = files
      .filter((f) => readFileSync(f, 'utf8').includes('getWorkspaceByCustomerId'))
      .map((f) => f.replace(srcDir, '').split('\\').join('/'));

    // Only the definition and the webhook handler may reference it.
    expect(importers).toContain('/worker/lib/stripeClient.ts');
    const nonWebhookImporters = importers.filter(
      (f) => !f.includes('/worker/lib/stripeClient.ts') && !f.includes('/worker/handlers/stripeWebhook.ts')
    );
    expect(nonWebhookImporters).toEqual([]);
  });
});
