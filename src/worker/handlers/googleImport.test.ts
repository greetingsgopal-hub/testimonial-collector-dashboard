import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Google import regression tests.
 *
 * 1. Imported Google reviews must be written to the `reviews` collection (the
 *    dashboard reads `reviews`, not `testimonials`) with the full Review doc
 *    shape so they appear in the dashboard and pass firestore.rules.
 * 2. Imported reviews must carry a projectId (the dashboard lists reviews
 *    per-project) — resolved from the request or the owner's most recent project.
 * 3. socialStatus/socialDisconnect must include the 'google' platform.
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

const saveDocumentMock = vi.hoisted(() => vi.fn());
const queryUserDocumentsMock = vi.hoisted(() => vi.fn());
vi.mock('../lib/firestoreAdmin', () => ({
  saveDocument: saveDocumentMock,
  queryUserDocuments: queryUserDocumentsMock,
}));

import { handleGooglePlaceImport } from './googlePlaceImport';

const ENV = {
  APP_ENCRYPTION_KEY: 'test-key-material-gi',
  GOOGLE_PLACES_API_KEY: 'places-key',
} as any;

const AUTH = { Authorization: 'Bearer token_user_123' };

function post(path: string, body?: object) {
  return new Request(`https://worker.dev/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  saveDocumentMock.mockResolvedValue(undefined);
});

describe('Google place import writes Review-shaped docs to the reviews collection', () => {
  it('saves imported reviews to `reviews` with full Review shape + projectId from request', async () => {
    queryUserDocumentsMock.mockResolvedValue([]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      // Raw Google Places API response shape (what fetchGooglePlaceReviews maps from)
      json: async () => ({
        result: {
          name: 'Test Place',
          rating: 4.8,
          user_ratings_total: 2,
          reviews: [
            {
              author_name: 'Alice Smith',
              profile_photo_url: 'https://lh3.googleusercontent.com/a.jpg',
              rating: 5,
              text: 'Great service, highly recommended!',
              time: 1756684800,
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await handleGooglePlaceImport(
      post('google/import-place', { placeId: 'ChIJ12345', projectId: 'proj_explicit' }),
      ENV
    );

    expect(res.status).toBe(200);
    expect(saveDocumentMock).toHaveBeenCalledTimes(1);
    const [collection, docId, doc] = saveDocumentMock.mock.calls[0];
    expect(collection).toBe('reviews');
    expect(docId).toMatch(/^google_place_\d+_0$/);
    expect(doc.projectId).toBe('proj_explicit');
    expect(doc.ownerId).toBe('user_123');
    expect(doc.name).toBe('Alice Smith');
    expect(doc.content).toBe('Great service, highly recommended!');
    expect(doc.source).toBe('google');
    expect(doc.status).toBe('approved');
    expect(doc.type).toBe('text');
    expect(Array.isArray(doc.tags)).toBe(true);
    expect(doc.consent).toBe(true);
    expect(doc.helpfulCount).toBe(0);
    expect(doc.isFeatured).toBe(false);
    expect(doc.email).toBe('');
    vi.unstubAllGlobals();
  });

  it('falls back to the most recent project when no projectId is provided', async () => {
    queryUserDocumentsMock.mockResolvedValue([
      { id: 'proj_old', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'proj_new', createdAt: '2026-09-01T00:00:00Z' },
    ]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          name: 'Test Place',
          rating: 4.5,
          user_ratings_total: 1,
          reviews: [
            {
              author_name: 'Bob Jones',
              rating: 4,
              text: 'Solid experience overall, would return.',
              time: 1753142400,
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await handleGooglePlaceImport(
      post('google/import-place', { placeId: 'ChIJ12345' }),
      ENV
    );

    expect(res.status).toBe(200);
    const [, , doc] = saveDocumentMock.mock.calls[0];
    expect(doc.projectId).toBe('proj_new');
    vi.unstubAllGlobals();
  });

  it('never writes to the dead `testimonials` collection', async () => {
    queryUserDocumentsMock.mockResolvedValue([]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          name: 'Test Place',
          rating: 5,
          user_ratings_total: 1,
          reviews: [
            {
              author_name: 'Carol White',
              rating: 5,
              text: 'Absolutely wonderful experience from start to finish.',
              time: 1751328000,
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await handleGooglePlaceImport(post('google/import-place', { placeId: 'ChIJ12345' }), ENV);

    const collections = saveDocumentMock.mock.calls.map((c) => c[0]);
    expect(collections).not.toContain('testimonials');
    vi.unstubAllGlobals();
  });
});

describe('socialStatus and socialDisconnect include the google platform', () => {
  it('socialStatus reports google connection state', async () => {
    const getDocumentMock = vi.fn().mockResolvedValue(null);
    // socialStatus uses getDocument; re-mock firestoreAdmin for this test
    vi.doMock('../lib/firestoreAdmin', () => ({
      saveDocument: saveDocumentMock,
      queryUserDocuments: queryUserDocumentsMock,
      getDocument: getDocumentMock,
    }));
    const { handleSocialStatus: freshStatus } = await import('./socialStatus');
    const res = await freshStatus(
      new Request('https://worker.dev/api/social-status', { headers: AUTH }),
      ENV
    );
    const data = await res.json();
    expect(data.connections).toHaveProperty('google');
    expect(data.connections.google.connected).toBe(false);
  });

  it('socialDisconnect accepts google and deletes the owner-scoped connection doc', async () => {
    const deleteDocumentMock = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../lib/firestoreAdmin', () => ({
      saveDocument: saveDocumentMock,
      queryUserDocuments: queryUserDocumentsMock,
      deleteDocument: deleteDocumentMock,
    }));
    const { handleSocialDisconnect: freshDisconnect } = await import('./socialDisconnect');
    const res = await freshDisconnect(post('social-disconnect', { platform: 'google' }), ENV);
    expect(res.status).toBe(200);
    expect(deleteDocumentMock).toHaveBeenCalledWith(
      'social_connections',
      'user_123_google',
      'token_user_123',
      ENV
    );
  });
});
