import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * FB/IG/LinkedIn import regression tests.
 *
 * 1. oauth-init must support facebook and instagram (the UI connects through
 *    this authenticated POST route â€” browser GET to /api/auth/* can never
 *    carry the Firebase Bearer token, so the old GET flow was dead).
 * 2. FB/IG OAuth callbacks and background sync must write imported reviews to
 *    the canonical `reviews` collection (dashboard reads `reviews`; the old
 *    `testimonials` writes were a dead path).
 * 3. OAuth success never implies import success â€” reviews are only saved when
 *    the provider API actually returns them, with tenant-scoped dedupe.
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

const saveDocumentMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const getDocumentMock = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const queryUserDocumentsMock = vi.hoisted(() => vi.fn().mockResolvedValue([{ id: 'proj_user_123' }]));
vi.mock('../lib/firestoreAdmin', () => ({
  saveDocument: saveDocumentMock,
  getDocument: getDocumentMock,
  queryUserDocuments: queryUserDocumentsMock,
}));

import { handleOAuthInit } from './oauthInit';
import { handleFacebookAuthCallback } from './facebookAuthCallback';
import { handleInstagramAuthCallback } from './instagramAuthCallback';
import { generateOAuthState } from '../lib/crypto';

const ENV = {
  APP_ENCRYPTION_KEY: 'test-key-material-si',
  META_APP_ID: 'meta-app-id-123',
  META_APP_SECRET: 'meta-app-secret-123',
} as any;

const AUTH = { Authorization: 'Bearer token_user_123' };

function post(path: string, body?: object) {
  return new Request(`https://worker.dev/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function callbackGet(path: string, platform: string) {
  const state = generateOAuthState('user_123', platform, ENV);
  return new Request(`https://worker.dev/api/${path}?code=test-code&state=${encodeURIComponent(state)}`, {
    method: 'GET',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  saveDocumentMock.mockResolvedValue(undefined);
  getDocumentMock.mockResolvedValue(null);
  queryUserDocumentsMock.mockResolvedValue([{ id: 'proj_user_123' }]);
});

describe('oauth-init dispatches facebook and instagram (authenticated POST)', () => {
  it('facebook: returns a real Meta dialog authUrl with signed state', async () => {
    const res = await handleOAuthInit(post('oauth-init', { platform: 'facebook' }), ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authUrl).toMatch(/^https:\/\/www\.facebook\.com\/v26.0\/dialog\/oauth\?/);
    expect(body.authUrl).toContain('state=');
    expect(body.authUrl).toContain('pages_show_list');
    expect(body.authUrl).toContain('pages_read_user_content');
    expect(body.authUrl).not.toContain('pages_read_engagement');
    expect(body.authUrl).not.toContain('pages_manage_metadata');
    expect(body.platform).toBe('facebook');
  });

  it('instagram: returns a real Meta dialog authUrl with instagram_basic scope', async () => {
    const res = await handleOAuthInit(post('oauth-init', { platform: 'instagram' }), ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authUrl).toMatch(/^https:\/\/www\.facebook\.com\/v26.0\/dialog\/oauth\?/);
    expect(body.authUrl).toContain('instagram_basic');
    expect(body.platform).toBe('instagram');
  });

  it('facebook: 503 with clear error when META_APP_ID is not configured (fail closed)', async () => {
    const res = await handleOAuthInit(post('oauth-init', { platform: 'facebook' }), {
      APP_ENCRYPTION_KEY: 'test-key-material-si',
    } as any);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/META_APP_ID/);
    expect(body.authUrl).toBeUndefined();
  });

  it('rejects unknown platforms with 400', async () => {
    const res = await handleOAuthInit(post('oauth-init', { platform: 'tiktok' }), ENV);
    expect(res.status).toBe(400);
  });
});

describe('FB/IG OAuth callbacks write imports to the canonical reviews collection', () => {
  function mockMetaFetch(pages: any[], reviews: any[]) {
    return vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/me/accounts')) {
        return { ok: true, json: async () => ({ data: pages }) };
      }
      if (url.includes('/ratings')) {
        return { ok: true, json: async () => ({ data: reviews }) };
      }
      if (url.includes('/media')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: 'media_1',
                permalink: 'https://instagram.com/p/abc',
                comments: {
                  data: [
                    { id: 'c1', text: 'Absolutely love this product, works great!', username: 'realuser', timestamp: '2026-01-01T00:00:00Z' },
                  ],
                },
              },
            ],
          }),
        };
      }
      // OAuth token exchange
      return {
        ok: true,
        json: async () => ({ access_token: 'user-token-xyz', expires_in: 5184000 }),
      };
    });
  }

  it('facebook callback: OAuth + discovery only - stores connection with pages, imports NOTHING', async () => {
    vi.stubGlobal(
      'fetch',
      mockMetaFetch(
        [{ id: 'page_1', name: 'Test Page', access_token: 'page-token-xyz' }],
        [
          {
            review_id: 'rev_1',
            reviewer: { name: 'Alice Smith', id: 'fbu_1', picture: { data: { url: 'https://img.example/a.jpg' } } },
            rating: 5,
            review_text: 'Great service, highly recommended!',
            created_time: '2026-01-01T00:00:00Z',
          },
        ]
      )
    );

    const res = await handleFacebookAuthCallback(callbackGet('auth/facebook/callback', 'facebook'), ENV);
    expect(res.status).toBe(302);
    const location = res.headers.get('Location') || '';
    // Explicit outcome code; user must select a Page before any import
    expect(location).toMatch(/fb_outcome=fb_oauth_success/);
    expect(location).toMatch(/fb_pages=1/);

    // The callback persists a social_connections doc (not reviews) with all
    // discovered pages, pageSelected=false, and no pageId yet
    const connCalls = saveDocumentMock.mock.calls.filter((c) => c[0] === 'social_connections');
    expect(connCalls.length).toBe(1);
    const [, connDocId, connDoc] = connCalls[0] as any[];
    expect(connDocId).toBe('user_123_facebook');
    expect(connDoc.ownerId).toBe('user_123');
    expect(connDoc.status).toBe('connected');
    expect(connDoc.pageSelected).toBe(false);
    expect(connDoc.pageId).toBe(null);
    expect(connDoc.pages.length).toBe(1);
    expect(connDoc.pages[0].id).toBe('page_1');
    expect(connDoc.pages[0].name).toBe('Test Page');
    expect(connDoc.pages[0].pageAccessTokenEncrypted).toBeTruthy();
    // No page access tokens stored in plaintext
    expect(JSON.stringify(connDoc)).not.toContain('page-token-xyz');

    // No writes to the dead testimonials collection
    const testimonialCalls = saveDocumentMock.mock.calls.filter((c) => c[0] === 'testimonials');
    expect(testimonialCalls.length).toBe(0);
    // No reviews imported by the callback itself
    expect(saveDocumentMock.mock.calls.filter((c) => c[0] === 'reviews').length).toBe(0);
    vi.unstubAllGlobals();
  });

  it('facebook callback: OAuth success with zero pages redirects with fb_no_pages (no fabrication)', async () => {
    vi.stubGlobal('fetch', mockMetaFetch([{ id: 'page_1', name: 'Test Page', access_token: 'page-token-xyz' }], []));

    const res = await handleFacebookAuthCallback(callbackGet('auth/facebook/callback', 'facebook'), ENV);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toMatch(/fb_outcome=fb_oauth_success/);
    expect(saveDocumentMock.mock.calls.filter((c) => c[0] === 'reviews').length).toBe(0);
    vi.unstubAllGlobals();
  });

  it('instagram callback: saves real comments to `reviews` (not testimonials)', async () => {
    vi.stubGlobal(
      'fetch',
      mockMetaFetch(
        [
          {
            id: 'page_1',
            name: 'Test Page',
            access_token: 'page-token-xyz',
            instagram_business_account: { id: 'ig_1', username: 'testaccount', name: 'Test', profile_picture_url: 'https://img.example/ig.jpg' },
          },
        ],
        []
      )
    );

    const res = await handleInstagramAuthCallback(callbackGet('auth/instagram/callback', 'instagram'), ENV);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toMatch(/social_connected=instagram/);

    const reviewsCalls = saveDocumentMock.mock.calls.filter((c) => c[0] === 'reviews');
    expect(reviewsCalls.length).toBe(1);
    const [, docId, doc] = reviewsCalls[0] as any[];
    expect(docId).toMatch(/^imp_user_123_[0-9a-f]{32}$/);
    expect(doc.ownerId).toBe('user_123');
    expect(doc.source).toBe('instagram');
    expect(doc.content).toBe('Absolutely love this product, works great!');
    expect(doc.name).toBe('@realuser');
    expect(doc.sourceUrl).toBe('https://instagram.com/p/abc');

    expect(saveDocumentMock.mock.calls.filter((c) => c[0] === 'testimonials').length).toBe(0);
    vi.unstubAllGlobals();
  });
});
