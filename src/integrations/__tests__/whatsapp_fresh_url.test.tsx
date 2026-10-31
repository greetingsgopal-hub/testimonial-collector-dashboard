// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

const { freshUrlMock } = vi.hoisted(() => ({
  freshUrlMock: vi.fn(async (path: string) => `https://storage.example/${encodeURIComponent(path)}?token=fresh`),
}));

vi.mock('../../firebase-adapters/firebase', () => ({
  db: { app: { options: { storageBucket: 'pandapraise.appspot.com' } } },
  auth: { currentUser: { uid: 'user_1' } },
  storage: {},
  getFreshUrl: freshUrlMock,
}));

const firestoreMocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => new Date()),
  where: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({ ...firestoreMocks }));

import { WhatsAppCollect_Firebase, getFreshUrl } from '../whatsapp/WhatsAppCollect_Firebase';

describe('WhatsAppCollect_Firebase fresh Storage URL behavior', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('resolves a fresh URL from a Firebase Storage path', async () => {
    const path = 'whatsapp/919800000012/video.mp4';
    const url = await getFreshUrl(path);
    expect(freshUrlMock).toHaveBeenCalledWith(path);
    expect(url).toContain('?token=fresh');
  });

  it('loads media from storagePath instead of a stale videoUrl', async () => {
    const handleUrlChange = vi.fn();
    const path = 'whatsapp/test_user/fresh_reel.mp4';
    const freshUrl = `https://storage.example/${encodeURIComponent(path)}?token=fresh`;

    await act(async () => {
      root.render(
        <WhatsAppCollect_Firebase
          doc={{ id: 'test_doc_1', storagePath: path, videoUrl: 'https://expired-24h-url.com' }}
          onVideoUrlChange={handleUrlChange}
        />
      );
    });

    expect(freshUrlMock).toHaveBeenCalledWith(path);
    expect(handleUrlChange).toHaveBeenCalledWith(freshUrl, 'test_doc_1');
    expect(container.textContent).toContain('Fresh Storage URL');
    expect(container.querySelector('video')?.getAttribute('src')).toBe(freshUrl);
  });

  it('shows an honest empty state instead of fabricated incoming reviews', async () => {
    await act(async () => root.render(<WhatsAppCollect_Firebase />));

    expect(container.textContent).toContain('No WhatsApp videos have arrived yet.');
    expect(container.textContent).not.toContain('Ananya S.');
    expect(container.textContent).not.toContain('Rahul M.');
  });
});

