// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { StorageImage, StorageVideo } from '../common/StorageMedia';
import * as firebaseAdapters from '../../firebase-adapters/firebase';

vi.mock('../../firebase-adapters/firebase', () => ({
  db: {},
  storage: {},
  getFreshUrl: vi.fn(async (path: string) => `https://firebasestorage.googleapis.com/refreshed/${encodeURIComponent(path)}?token=fresh_999`)
}));

describe('Resilient Storage Media Error Recovery Suite', () => {
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

  it('StorageImage intercepts expired 4xx firebasestorage or fbcdn URL and calls getFreshUrl', async () => {
    await act(async () => {
      root.render(
        <StorageImage
          src="https://firebasestorage.googleapis.com/v0/b/demo/o/test.jpg?token=expired"
          storagePath="avatars/user_1.jpg"
          alt="Avatar"
        />
      );
    });

    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeDefined();

    // Simulate image error event (4xx expired URL)
    await act(async () => {
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);
    });

    expect(firebaseAdapters.getFreshUrl).toHaveBeenCalledWith('avatars/user_1.jpg');
  });

  it('StorageImage intercepts expired fbcdn.net URL and refreshes source', async () => {
    await act(async () => {
      root.render(
        <StorageImage
          src="https://lookaside.fbcdn.net/whatsapp/expired_media_123.jpg"
          storagePath="whatsapp/phone1/video1.mp4"
          alt="WhatsApp Media"
        />
      );
    });

    const img = container.querySelector('img') as HTMLImageElement;
    await act(async () => {
      img.dispatchEvent(new Event('error'));
    });

    expect(firebaseAdapters.getFreshUrl).toHaveBeenCalledWith('whatsapp/phone1/video1.mp4');
  });

  it('StorageVideo intercepts expired URL and updates video src', async () => {
    await act(async () => {
      root.render(
        <StorageVideo
          src="https://firebasestorage.googleapis.com/v0/b/demo/o/whatsapp%2Fvideo.mp4?token=expired"
          storagePath="whatsapp/phone1/video1.mp4"
        />
      );
    });

    const video = container.querySelector('video') as HTMLVideoElement;
    await act(async () => {
      video.dispatchEvent(new Event('error'));
    });

    expect(firebaseAdapters.getFreshUrl).toHaveBeenCalledWith('whatsapp/phone1/video1.mp4');
  });
});
