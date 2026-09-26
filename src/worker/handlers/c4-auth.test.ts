import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * C4 regression test — ?uid= identity trust.
 * Handlers must derive identity ONLY from a verified Bearer token.
 * No demo-user fallback, no ?uid= query param trust.
 */

// Mock Firebase auth: any token starting "token_" verifies to uid = token value
vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: (header: string) => (header || '').replace(/^Bearer\s+/i, ''),
  verifyFirebaseToken: async (token: string) => {
    if (token && token.startsWith('token_')) {
      return { uid: token.slice('token_'.length) };
    }
    return null;
  },
}));

import { handleGoogleAuthInit } from './googleAuthInit';
import { handleFacebookAuthInit } from './facebookAuthInit';
import { handleInstagramAuthInit } from './instagramAuthInit';
import { handleGooglePlaceImport } from './googlePlaceImport';
import { handleInstagramFetchMentions } from './instagramFetchMentions';

const ENV = {
  APP_ENCRYPTION_KEY: 'test-key-material-c4',
  GOOGLE_CLIENT_ID: 'google-client-id',
  META_APP_ID: 'meta-app-id',
  LINKEDIN_CLIENT_ID: 'linkedin-client-id',
} as any;

const AUTH_INIT_HANDLERS = [
  { name: 'googleAuthInit', handler: handleGoogleAuthInit, platform: 'google' },
  { name: 'facebookAuthInit', handler: handleFacebookAuthInit, platform: 'facebook' },
  { name: 'instagramAuthInit', handler: handleInstagramAuthInit, platform: 'instagram' },
];

function post(path: string, headers: Record<string, string> = {}, body?: object) {
  return new Request(`https://worker.dev/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function get(path: string, headers: Record<string, string> = {}) {
  return new Request(`https://worker.dev/api/${path}`, { method: 'GET', headers });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('C4: identity must come from verified Bearer token only', () => {
  for (const { name, handler } of AUTH_INIT_HANDLERS) {
    it(`${name}: POST without auth returns 401 even when ?uid= is supplied`, async () => {
      const res = await handler(post(`auth/x/init?uid=user_demo_gopal`), ENV);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toMatch(/Authentication required/);
    });

    it(`${name}: GET without auth redirects to sign-in error, ignoring ?uid=`, async () => {
      const res = await handler(get(`auth/x/init?uid=user_demo_gopal`), ENV);
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toMatch(/social_error=/);
      expect(res.headers.get('Location')).not.toMatch(/connected=/);
    });

    it(`${name}: authenticated attacker cannot impersonate victim via ?uid=`, async () => {
      // Attacker has their own valid token but claims to be the victim via ?uid=
      const res = await handler(
        post(`auth/x/init?uid=victim_user`, {
          Authorization: 'Bearer token_attacker_uid',
        }),
        ENV
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      // OAuth state must be bound to the ATTACKER's uid (from token), not the ?uid= value
      const stateUserId = body.state.split('.')[0];
      expect(stateUserId).toBe('attacker_uid');
      expect(stateUserId).not.toBe('victim_user');
    });

    it(`${name}: invalid/garbage token is rejected with 401`, async () => {
      const res = await handler(
        post(`auth/x/init`, { Authorization: 'Bearer garbage-token' }),
        ENV
      );
      expect(res.status).toBe(401);
    });
  }

  it('googlePlaceImport: POST without auth returns 401 (no demo user fallback)', async () => {
    const res = await handleGooglePlaceImport(
      post(`google/import-place`, {}, { placeId: 'ChIJ12345' }),
      ENV
    );
    expect(res.status).toBe(401);
  });

  it('googlePlaceImport: invalid token returns 401 even with a valid-looking body', async () => {
    const res = await handleGooglePlaceImport(
      post(`google/import-place`, { Authorization: 'Bearer not-a-firebase-token' }, { placeId: 'ChIJ12345' }),
      ENV
    );
    expect(res.status).toBe(401);
  });

  it('instagramFetchMentions: POST without auth returns 401 (no demo user fallback)', async () => {
    const res = await handleInstagramFetchMentions(
      post(`instagram/fetch-mentions`, {}, { postUrl: 'https://instagram.com/p/abc123' }),
      ENV
    );
    expect(res.status).toBe(401);
  });

  it('instagramFetchMentions: invalid token returns 401', async () => {
    const res = await handleInstagramFetchMentions(
      post(`instagram/fetch-mentions`, { Authorization: 'Bearer bogus' }, { postUrl: 'https://instagram.com/p/abc123' }),
      ENV
    );
    expect(res.status).toBe(401);
  });
});
