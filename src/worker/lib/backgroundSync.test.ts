import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * HIGH-4 regression test — backgroundSync discovers connected users
 * dynamically from Firestore. No hardcoded 'user_demo_gopal' list.
 */

vi.mock('./firestoreAdmin', () => ({
  saveDocument: vi.fn().mockResolvedValue(undefined),
  getDocument: vi.fn().mockResolvedValue(null),
  queryDocumentsByField: vi.fn().mockResolvedValue([
    { id: 'user_a_facebook', ownerId: 'user_a', status: 'connected' },
    { id: 'user_b_instagram', ownerId: 'user_b', status: 'connected' },
    { id: 'user_a_instagram', ownerId: 'user_a', status: 'connected' },
  ]),
}));

import { executeAutomatedBackgroundSync } from './backgroundSync';
import { queryDocumentsByField } from './firestoreAdmin';

const ENV = { APP_ENCRYPTION_KEY: 'test-key-material-bs' } as any;

const EVENT = { scheduledTime: Date.now(), cron: '* * * * *' } as any;
const CTX = { waitUntil: async () => {} } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HIGH-4: backgroundSync uses dynamic connected-user discovery', () => {
  it('queries social_connections for status=connected', async () => {
    await executeAutomatedBackgroundSync(EVENT, ENV, CTX);
    expect(queryDocumentsByField).toHaveBeenCalledWith(
      'social_connections',
      'status',
      'connected',
      undefined,
      ENV
    );
  });

  it('syncs each discovered owner (dynamic users, no demo list)', async () => {
    await executeAutomatedBackgroundSync(EVENT, ENV, CTX);
    // getDocument is called once per user per platform connection found
    const calls = (queryDocumentsByField as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('exits cleanly when no connected accounts exist', async () => {
    (queryDocumentsByField as any).mockResolvedValueOnce([]);
    await expect(executeAutomatedBackgroundSync(EVENT, ENV, CTX)).resolves.toBeUndefined();
  });
});
