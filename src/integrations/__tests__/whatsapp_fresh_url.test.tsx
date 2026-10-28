// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WhatsAppCollect_Firebase, getFreshUrl } from '../whatsapp/WhatsAppCollect_Firebase';
import * as storageModule from 'firebase/storage';

vi.mock('../../firebase-adapters/firebase', () => ({
  db: {
    app: { options: { storageBucket: 'pandapraise.appspot.com' } }
  },
  storage: {},
  getFreshUrl: vi.fn(async (path: string) => `https://firebasestorage.googleapis.com/v0/b/demo/o/${encodeURIComponent(path)}?alt=media&token=fresh-token-123`)
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  orderBy: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn((_storage, path) => ({ fullPath: path })),
  getDownloadURL: vi.fn(async (urlRef) => `https://firebasestorage.googleapis.com/fresh/${urlRef.fullPath}?expires=1week`)
}));

describe('WhatsAppCollect_Firebase Fresh Storage URL Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('getFreshUrl calls getStorage, ref, and getDownloadURL', async () => {
    const freshUrl = await getFreshUrl('whatsapp/+919800000012/video.mp4');
    expect(storageModule.getStorage).toHaveBeenCalled();
    expect(storageModule.ref).toHaveBeenCalledWith(expect.anything(), 'whatsapp/+919800000012/video.mp4');
    expect(storageModule.getDownloadURL).toHaveBeenCalled();
    expect(freshUrl).toBe('https://firebasestorage.googleapis.com/fresh/whatsapp/+919800000012/video.mp4?expires=1week');
  });

  it('generates fresh URL when doc.storagePath changes instead of using stale cached URL', async () => {
    const handleUrlChange = vi.fn();

    await act(async () => {
      root.render(
        <WhatsAppCollect_Firebase 
          doc={{ id: 'test_doc_1', storagePath: 'whatsapp/test_user/fresh_reel.mp4', videoUrl: 'https://expired-24h-url.com' }} 
          onVideoUrlChange={handleUrlChange}
        />
      );
    });

    expect(storageModule.getDownloadURL).toHaveBeenCalled();
    expect(handleUrlChange).toHaveBeenCalledWith(
      'https://firebasestorage.googleapis.com/fresh/whatsapp/test_user/fresh_reel.mp4?expires=1week'
    );
    expect(container.textContent).toContain('Fresh Storage URL');
  });

  it('renders 02 COLLECT step with WhatsApp UI details', async () => {
    await act(async () => {
      root.render(<WhatsAppCollect_Firebase />);
    });

    expect(container.textContent).toContain('02');
    expect(container.textContent).toContain('WHATSAPP UI • INCOMING');
    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('Ananya S.');
    expect(container.textContent).toContain('Rahul M.');
  });
});

