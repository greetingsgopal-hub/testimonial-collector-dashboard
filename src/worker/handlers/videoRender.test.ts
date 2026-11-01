import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  extractBearerToken: vi.fn(),
  verifyFirebaseToken: vi.fn(),
  getDocument: vi.fn(),
  saveDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getServiceAccountAccessToken: vi.fn(),
}));

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: mocks.extractBearerToken,
  verifyFirebaseToken: mocks.verifyFirebaseToken,
}));
vi.mock('../lib/firestoreAdmin', () => ({
  getDocument: mocks.getDocument,
  saveDocument: mocks.saveDocument,
  deleteDocument: mocks.deleteDocument,
}));
vi.mock('../lib/googleAuth', () => ({
  getServiceAccountAccessToken: mocks.getServiceAccountAccessToken,
}));

import { handleVideoRender } from './videoRender';

const SOURCE_RECORD = {
  id: 'media123',
  ownerUid: 'owner-uid',
  storagePath: 'whatsapp/owner-uid/919999999999/media123.mp4',
};

describe('POST /api/video/render', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const rendererFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    mocks.extractBearerToken.mockImplementation((header: string | null) => header?.replace(/^Bearer\s+/i, '') || null);
    mocks.verifyFirebaseToken.mockResolvedValue({ uid: 'owner-uid' });
    mocks.getDocument.mockResolvedValue(SOURCE_RECORD);
    mocks.saveDocument.mockResolvedValue(undefined);
    mocks.deleteDocument.mockResolvedValue(undefined);
    mocks.getServiceAccountAccessToken.mockResolvedValue('service-account-token');
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('alt=media')) {
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      }
      return new Response('{}', { status: 200 });
    });
    rendererFetch.mockImplementation(async (input: string) => {
      if (input.includes('/prepare?')) return new Response('prepared', { status: 201 });
      if (input.includes('/render?')) {
        const bytes = new Uint8Array(6 * 1024 * 1024);
        return new Response(bytes, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(bytes.byteLength),
            'x-video-bitrate': '6100000',
          },
        });
      }
      return new Response(null, { status: 204 });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function request(token = 'owner-token', body: unknown = { testimonialId: 'media123' }) {
    return new Request('https://pandapraise.com/api/video/render', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  function env() {
    return {
      FIREBASE_STORAGE_BUCKET: 'example.firebasestorage.app',
      FIREBASE_PROJECT_ID: 'example-project',
      FFMPEG_RENDERER: {
        idFromName: vi.fn((name: string) => name),
        get: vi.fn(() => ({ fetch: rendererFetch })),
      },
    } as any;
  }

  it('renders three private owner-scoped exports for the owning account', async () => {
    const response = await handleVideoRender(request(), env());
    const result = await response.json() as { ok: boolean; exports: Array<{ id: string; ratio: string; storagePath: string }> };

    expect(response.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.exports.map((item) => item.ratio)).toEqual(['9:16', '4:5', '1:1']);
    expect(result.exports.every((item) => item.id.length > 0)).toBe(true);
    expect(result.exports.every((item) => item.storagePath.startsWith('edits/owner-uid/media123/'))).toBe(true);
    expect(mocks.saveDocument).toHaveBeenCalledTimes(3);
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      'video_exports',
      expect.stringMatching(/^owner-uid_media123_9x16_/),
      expect.objectContaining({ ownerUid: 'owner-uid', status: 'done', storagePath: expect.stringContaining('edits/owner-uid/') }),
      undefined,
      expect.any(Object),
    );
  });

  it('does not render a video owned by another Firebase account', async () => {
    mocks.verifyFirebaseToken.mockResolvedValue({ uid: 'other-uid' });
    const response = await handleVideoRender(request('other-token'), env());

    expect(response.status).toBe(404);
    expect(rendererFetch).not.toHaveBeenCalled();
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it('rejects an invalid Firebase ID token', async () => {
    mocks.verifyFirebaseToken.mockResolvedValue(null);
    const response = await handleVideoRender(request('invalid-token'), env());

    expect(response.status).toBe(401);
    expect(mocks.getDocument).not.toHaveBeenCalled();
    expect(rendererFetch).not.toHaveBeenCalled();
  });

  it('rejects a source path outside the authenticated owner namespace', async () => {
    mocks.getDocument.mockResolvedValue({ ...SOURCE_RECORD, storagePath: 'whatsapp/someone-else/phone/media123.mp4' });
    const response = await handleVideoRender(request(), env());

    expect(response.status).toBe(403);
    expect(rendererFetch).not.toHaveBeenCalled();
  });
});
