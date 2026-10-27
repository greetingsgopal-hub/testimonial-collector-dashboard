// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { FinalWorkflow } from '../FinalWorkflow';

vi.mock('../../firebase-adapters/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => new Date()),
  collection: vi.fn(),
  onSnapshot: vi.fn(() => () => {})
}));

describe('FinalWorkflow Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders all 3 steps: 01 CONNECT, 02 COLLECT, 03 EDIT with AUTO badge', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <FinalWorkflow />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('PandaPraise • Final • Firebase • AUTO');
    expect(container.textContent).toContain('01 CONNECT');
    expect(container.textContent).toContain('02 COLLECT');
    expect(container.textContent).toContain('03 EDIT');
    expect(container.textContent).toContain('AUTO');
    expect(container.textContent).toContain('Firebase Collections');
    expect(container.textContent).toContain('Storage • Top Notch');
    expect(container.textContent).toContain('Verify • Work Done');
  });
});
