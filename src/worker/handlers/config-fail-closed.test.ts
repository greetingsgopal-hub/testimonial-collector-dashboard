import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * HIGH-2 regression test — OAuth flows fail closed when platform credentials
 * are not configured. No fake-success redirects, no fake authUrl fields.
 */

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
import { handleLinkedInAuthInit } from './linkedinAuthInit';
import { handleOAuthInit } from './oauthInit';
import { handleGoogleAuthCallback } from './googleAuthCallback';
import { handleFacebookAuthCallback } from './facebookAuthCallback';
import { handleInstagramAuthCallback } from './instagramAuthCallback';
import { handleLinkedInAuthCallback } from './linkedinAuthCallback';
import { handleOAuthCallback } from './oauthCallback';
import { generateOAuthState } from '../lib/crypto';

const ENV = {
  APP_ENCRYPTION_KEY: 'test-key-material-fc',
  // No platform credentials configured at all.
} as any;

const AUTH = { Authorization: 'Bearer token_user_123' };

function post(path: string, body?: object) {
  return new Request(`https://worker.dev/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function get(path: string) {
  return new Request(`https://worker.dev/api/${path}`, { method: 'GET', headers: AUTH });
}

function callbackGet(path: string, platform: string) {
  const state = generateOAuthState('user_123', platform, ENV);
  return new Request(`https://worker.dev/api/${path}?code=test-code&state=${encodeURIComponent(state)}`, {
    method: 'GET',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HIGH-2: init handlers fail closed when credentials are missing', () => {
  const cases = [
    { name: 'googleAuthInit', handler: handleGoogleAuthInit, path: 'auth/google/init' },
    { name: 'facebookAuthInit', handler: handleFacebookAuthInit, path: 'auth/facebook/init' },
    { name: 'instagramAuthInit', handler: handleInstagramAuthInit, path: 'auth/instagram/init' },
    { name: 'linkedinAuthInit', handler: handleLinkedInAuthInit, path: 'auth/linkedin/init' },
  ];

  for (const { name, handler, path } of cases) {
    it(`${name}: authenticated POST returns 503 with error, no authUrl`, async () => {
      const res = await handler(post(path), ENV);
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).toBeTruthy();
      expect(body.authUrl).toBeUndefined();
      expect(body.fallbackAuthUrl).toBeUndefined();
      expect(body.configured).toBe(false);
    });

    it(`${name}: authenticated GET redirects to social_error, never connected=`, async () => {
      const res = await handler(get(path), ENV);
      expect(res.status).toBe(302);
      const location = res.headers.get('Location') || '';
      expect(location).toMatch(/social_error=/);
      expect(location).not.toMatch(/connected=/);
      expect(location).not.toMatch(/social_connected=/);
    });
  }

  it('oauthInit (google platform): returns 503 with error, no fake authUrl', async () => {
    const res = await handleOAuthInit(post('oauth-init', { platform: 'google' }), ENV);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.authUrl).toBeUndefined();
  });
});

describe('HIGH-2: callbacks fail closed when credentials are missing (valid state)', () => {
  const cases = [
    { name: 'googleAuthCallback', handler: handleGoogleAuthCallback, path: 'auth/google/callback', platform: 'google' },
    { name: 'facebookAuthCallback', handler: handleFacebookAuthCallback, path: 'auth/facebook/callback', platform: 'facebook' },
    { name: 'instagramAuthCallback', handler: handleInstagramAuthCallback, path: 'auth/instagram/callback', platform: 'instagram' },
    { name: 'linkedinAuthCallback', handler: handleLinkedInAuthCallback, path: 'auth/linkedin/callback', platform: 'linkedin' },
    { name: 'oauthCallback (google)', handler: handleOAuthCallback, path: 'oauth-callback', platform: 'google' },
  ];

  for (const { name, handler, path, platform } of cases) {
    it(`${name}: valid state + missing creds redirects to social_error, never social_connected=`, async () => {
      const res = await handler(callbackGet(path, platform), ENV);
      expect(res.status).toBe(302);
      const location = res.headers.get('Location') || '';
      expect(location).toMatch(/social_error=/);
      expect(location).not.toMatch(/social_connected=/);
      expect(location).not.toMatch(/connected=/);
    });
  }
});
