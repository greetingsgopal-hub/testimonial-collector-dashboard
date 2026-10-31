// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AutoEditor } from '../AutoEditor';

vi.mock('../../firebase-adapters/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => new Date())
}));

describe('AutoEditor Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('renders step 03 EDIT as a real-video preview handoff', () => {
    act(() => {
      root.render(<AutoEditor videoUrl="" testimonialId="wa_test_01" />);
    });
    
    expect(container.textContent).toContain('03');
    expect(container.textContent).toContain('VIDEO STUDIO');
    expect(container.textContent).toContain('EDIT');
    expect(container.textContent).toContain('Select a real incoming WhatsApp video to continue.');
    expect(container.textContent).not.toContain('✓ Done');
    expect(container.textContent).not.toContain('Top Notch');
  });

  it('previews a supplied video without claiming an export exists', async () => {
    act(() => {
      root.render(<AutoEditor videoUrl="https://pandapraise.com/think_reel.mp4" testimonialId="wa_test_01" />);
    });

    expect(container.textContent).toContain('Preview loaded');
    expect(container.textContent).toContain('Automatic rendering is not connected to Firebase WhatsApp videos yet.');
    expect(container.textContent).not.toContain('✓ Done');
    expect(container.textContent).not.toContain('AUTO HOOK');
    expect(container.textContent).not.toContain('Top Notch');
    expect(container.querySelector('video')?.getAttribute('src')).toBe('https://pandapraise.com/think_reel.mp4');
  });
});

