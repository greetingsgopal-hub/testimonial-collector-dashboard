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

  it('renders step 03 EDIT card with auto badge and progress flow', () => {
    act(() => {
      root.render(<AutoEditor videoUrl="" testimonialId="wa_test_01" />);
    });
    
    expect(container.textContent).toContain('03');
    expect(container.textContent).toContain('HOOKS + RATIOS • AUTO');
    expect(container.textContent).toContain('EDIT');
    expect(container.textContent).toContain('Panda auto-cuts hooks (0-3s), adds captions, exports 9:16 / 4:5 / 1:1.');
    expect(container.textContent).toContain('Analyzing');
    expect(container.textContent).toContain('Auto-cut');
    expect(container.textContent).toContain('Captions');
    expect(container.textContent).toContain('Export');
  });

  it('runs auto pipeline and renders 3 exported ratio badges with top notch quality', async () => {
    act(() => {
      root.render(<AutoEditor videoUrl="https://pandapraise.com/think_reel.mp4" testimonialId="wa_test_01" />);
    });

    // Advance fake timers through analyzing (600ms) -> cutting (600ms) -> captioning (600ms) -> exporting (400ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(container.textContent).toContain('✓ Done');
    expect(container.textContent).toContain('AUTO HOOK');
    expect(container.textContent).toContain('0s → 3.1s');
    expect(container.textContent).toContain('pocket reveal');
    expect(container.textContent).toContain('9:16 • 1080x1920 • 10M CRF18');
    expect(container.textContent).toContain('4:5 • 1080x1350 • 8M CRF19');
    expect(container.textContent).toContain('1:1 • 1080x1080 • 8M CRF19');
    expect(container.textContent).toContain('AUTO ✓ Top Notch');
  });
});
