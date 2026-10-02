import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Facebook Page selection + import flow tests (work order item 13).
 *
 * Contract under test:
 *   - The OAuth callback NEVER imports reviews and NEVER auto-selects a Page.
 *   - Page selection requires authenticated POST with an explicit pageId
 *     that belongs to the caller's stored connection.
 *   - Import goes through the canonical Import Engine (tenant dedupe,
 *     canonical /reviews persistence).
 *   - Zero reviews is EMPTY_SUCCESS; API failure is REVIEW_FETCH_FAILED.
 *   - No tokens, page access tokens, or internal doc IDs ever appear in
 *     client-visible responses.
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

// Mock the canonical engine: the selection handler must route through it
const importProviderMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ status: 'SUCCESS', importedCount: 2, reviews: [{}, {}] })
);
vi.mock('../lib/importEngine', () => ({
  importProvider: importProviderMock,
  ImportStatus: {
    SUCCESS: 'SUCCESS',
    EMPTY_SUCCESS: 'EMPTY_SUCCESS',
    FAILED: 'FAILED',
    UNSUPPORTED: 'UNSUPPORTED',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    RESOURCE_SELECTION_REQUIRED: 'RESOURCE_SELECTION_REQUIRED',
  },
}));

vi.mock('../lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: true }),
}));

vi.mock('../lib/cors', () => ({
  getCorsHeaders: () => ({}),
}));

import { handleFacebookPageSelection } from './facebookPageSelection';
import { encryptToken } from '../lib/crypto';

const ENV = {
  APP_ENCRYPTION_KEY: 'test-key-material-fps',
} as any;

const AUTH = { Authorization: 'Bearer token_user_123' };

function getReq() {
  return new Request('https://worker.dev/api/facebook/pages', { method: 'GET', headers: AUTH });
}

function postReq(body?: object) {
  return new Request('https://worker.dev/api/facebook/select-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function connectedConnection(pages: any[]) {
  return {
    ownerId: 'user_123',
    platform: 'facebook',
    status: 'connected',
    pageSelected: false,
    pageId: null,
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      pageAccessTokenEncrypted: encryptToken(p.token || 'page-token-abc', ENV),
      profilePicture: null,
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  saveDocumentMock.mockResolvedValue(undefined);
  getDocumentMock.mockResolvedValue(null);
  queryUserDocumentsMock.mockResolvedValue([{ id: 'proj_user_123' }]);
  importProviderMock.mockResolvedValue({ status: 'SUCCESS', importedCount: 2, reviews: [{}, {}] });
});

describe('Facebook Page selection flow (explicit selection, canonical import)', () => {
  it('GET /facebook/pages: returns customer-safe page list (id + name only, no tokens)', async () => {
    getDocumentMock.mockResolvedValue(
      connectedConnection([
        { id: 'page_1', name: 'Alpha Page' },
        { id: 'page_2', name: 'Beta Page' },
      ])
    );
    const res = await handleFacebookPageSelection(getReq(), ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.pages.length).toBe(2);
    expect(body.pages[0]).toEqual({ pageId: 'page_1', name: 'Alpha Page', profilePicture: null });
    expect(JSON.stringify(body)).not.toContain('page-token-abc');
    expect(JSON.stringify(body)).not.toContain('Encrypted');
  });

  it('GET /facebook/pages: 401 AUTH_REQUIRED without Bearer token', async () => {
    const res = await handleFacebookPageSelection(
      new Request('https://worker.dev/api/facebook/pages', { method: 'GET' }),
      ENV
    );
    expect(res.status).toBe(401);
    expect((await res.json()).status).toBe('AUTH_REQUIRED');
  });

  it('GET /facebook/pages: NOT_CONNECTED when no connection doc exists', async () => {
    getDocumentMock.mockResolvedValue(null);
    const res = await handleFacebookPageSelection(getReq(), ENV);
    expect(res.status).toBe(400);
    expect((await res.json()).status).toBe('NOT_CONNECTED');
  });

  it('POST /facebook/select-page: rejects a pageId that is not in the caller connection (cross-tenant guard)', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    const res = await handleFacebookPageSelection(postReq({ pageId: 'someone_elses_page' }), ENV);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('INVALID_PAGE');
    expect(importProviderMock).not.toHaveBeenCalled();
  });

  it('POST /facebook/select-page: persists explicit selection then imports via canonical engine', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    const res = await handleFacebookPageSelection(postReq({ pageId: 'page_1' }), ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('IMPORT_SUCCESS');
    expect(body.importedCount).toBe(2);
    expect(body.pageName).toBe('Alpha Page');

    // Selection persisted with pageSelected=true
    const connSave = saveDocumentMock.mock.calls.filter((c) => c[0] === 'social_connections');
    expect(connSave.length).toBe(1);
    const conn = connSave[0][2] as any;
    expect(conn.pageSelected).toBe(true);
    expect(conn.pageId).toBe('page_1');

    // Import routed through the canonical engine with the selected page
    expect(importProviderMock).toHaveBeenCalledTimes(1);
    const engineArg = importProviderMock.mock.calls[0][0] as any;
    expect(engineArg.providerId).toBe('facebook');
    expect(engineArg.params.pageId).toBe('page_1');
    expect(engineArg.firebaseIdToken).toBe('token_user_123');
  });

  it('POST /facebook/select-page: EMPTY_SUCCESS when the engine returns zero reviews (not a failure)', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    importProviderMock.mockResolvedValue({ status: 'EMPTY_SUCCESS', importedCount: 0, reviews: [] });
    const res = await handleFacebookPageSelection(postReq({ pageId: 'page_1' }), ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('EMPTY_SUCCESS');
    expect(body.importedCount).toBe(0);
  });

  it('POST /facebook/select-page: REVIEW_FETCH_FAILED when the engine fetch fails (never an empty list)', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    importProviderMock.mockResolvedValue({ status: 'FAILED', error: 'Graph API unreachable' });
    const res = await handleFacebookPageSelection(postReq({ pageId: 'page_1' }), ENV);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.status).toBe('REVIEW_FETCH_FAILED');
  });

  it('POST /facebook/select-page: PAGE_TOKEN_FAILED when the engine reports auth failure', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    importProviderMock.mockResolvedValue({ status: 'AUTH_REQUIRED', error: 'token expired' });
    const res = await handleFacebookPageSelection(postReq({ pageId: 'page_1' }), ENV);
    expect(res.status).toBe(401);
    expect((await res.json()).status).toBe('PAGE_TOKEN_FAILED');
  });

  it('POST /facebook/select-page: INVALID_PAGE when no pageId supplied', async () => {
    getDocumentMock.mockResolvedValue(connectedConnection([{ id: 'page_1', name: 'Alpha Page' }]));
    const res = await handleFacebookPageSelection(postReq({}), ENV);
    expect(res.status).toBe(400);
    expect((await res.json()).status).toBe('INVALID_PAGE');
  });

  it('POST /facebook/select-page: 401 for unauthenticated caller even with a valid-looking pageId', async () => {
    const res = await handleFacebookPageSelection(
      new Request('https://worker.dev/api/facebook/select-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: 'page_1' }),
      }),
      ENV
    );
    expect(res.status).toBe(401);
    expect((await res.json()).status).toBe('AUTH_REQUIRED');
    expect(importProviderMock).not.toHaveBeenCalled();
  });
});
