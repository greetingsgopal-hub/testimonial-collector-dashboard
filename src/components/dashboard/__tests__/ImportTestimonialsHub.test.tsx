import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import ImportTestimonialsHub from '../ImportTestimonialsHub';

// Mock Firebase Firestore & Auth
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  addDoc: vi.fn().mockResolvedValue({ id: 'doc-mock-123' }),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithPopup: vi.fn().mockResolvedValue({ user: { displayName: 'Mock User', email: 'test@example.com' } }),
  GoogleAuthProvider: vi.fn(),
  FacebookAuthProvider: vi.fn(),
  TwitterAuthProvider: vi.fn(),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ImportTestimonialsHub - 4-Way Production Import Pipeline', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
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

  it('1. Renders stage 4 hero banner, workspace name, and all 5 mode buttons', async () => {
    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Test Workspace"
          onShiftToProof={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain('Import & Collect Testimonials');
    expect(container.textContent).toContain('Test Workspace');
    expect(container.textContent).toContain('Social Auto-Scraper');
    expect(container.textContent).toContain('Screenshots Import');
    expect(container.textContent).toContain('CSV Spreadsheet');
    expect(container.textContent).not.toContain('Manual Entry');
    expect(container.textContent).not.toContain('Social Login Directory');
    expect(container.textContent).not.toContain('Explore All 30+ Integration Directories');
  });

  it('2. Switching to Screenshots Import tab displays screenshot upload dropzone', async () => {
    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Test Workspace"
          onShiftToProof={vi.fn()}
        />
      );
    });

    const screenshotBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Screenshots Import')
    );
    expect(screenshotBtn).toBeDefined();

    await act(async () => {
      screenshotBtn?.click();
    });

    expect(container.textContent).toContain('Import Review Screenshots & Pictures');
    expect(container.textContent).toContain('Click to upload review screenshots');
  });

  it('3. Switching to CSV Spreadsheet tab renders 3-step pipeline and template download', async () => {
    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Test Workspace"
          onShiftToProof={vi.fn()}
        />
      );
    });

    const csvBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('CSV Spreadsheet')
    );
    expect(csvBtn).toBeDefined();

    await act(async () => {
      csvBtn?.click();
    });

    expect(container.textContent).toContain('Upload CSV Testimonials');
    expect(container.textContent).toContain('Download CSV Template');
    expect(container.textContent).toContain('1. Upload');
    expect(container.textContent).toContain('2. Map Fields');
    expect(container.textContent).toContain('3. Validate & Commit');
  });

  it('4. Directory explore button is completely removed from the header', async () => {
    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Acme HVAC"
          onShiftToProof={vi.fn()}
        />
      );
    });

    const exploreBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Explore All 30+')
    );
    expect(exploreBtn).toBeUndefined();
  });

  it('5. Purple banner does not render View Proof Section button', async () => {
    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Test Workspace"
          onShiftToProof={vi.fn()}
        />
      );
    });

    const viewProofBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('View Proof Section')
    );
    expect(viewProofBtn).toBeUndefined();
  });
});
