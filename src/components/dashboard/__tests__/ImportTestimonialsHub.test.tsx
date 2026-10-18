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
    expect(container.textContent).toContain('Manual Entry');
    expect(container.textContent).toContain('Social Login Directory');
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

  it('4. Manual entry form creates approved testimonial and shifts to Proof', async () => {
    const onShiftToProof = vi.fn();

    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Acme HVAC"
          onShiftToProof={onShiftToProof}
        />
      );
    });

    const manualBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Manual Entry')
    );
    expect(manualBtn).toBeDefined();

    await act(async () => {
      manualBtn?.click();
    });

    expect(container.textContent).toContain('Add Testimonial Manually');

    const nameInput = container.querySelector('input[placeholder="Customer Full Name *"]') as HTMLInputElement;
    const roleInput = container.querySelector('input[placeholder="Role & Company (e.g. Owner, Hartley Plumbing)"]') as HTMLInputElement;
    const contentTextarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(nameInput).not.toBeNull();
    expect(contentTextarea).not.toBeNull();
    expect(submitBtn).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(nameInput, 'Sarah Connor');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      nativeInputSetter?.call(roleInput, 'Cyberdyne Systems');
      roleInput.dispatchEvent(new Event('input', { bubbles: true }));

      nativeTextareaSetter?.call(contentTextarea, 'Outstanding customer service and fast resolution.');
      contentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // Advance fake timer to trigger shifting to proof callback
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(onShiftToProof).toHaveBeenCalledTimes(1);
    const passedItems = onShiftToProof.mock.calls[0][0];
    expect(passedItems.length).toBe(1);
    expect(passedItems[0].authorName).toBe('Sarah Connor');
    expect(passedItems[0].authorRole).toBe('Cyberdyne Systems');
    expect(passedItems[0].content).toBe('“Outstanding customer service and fast resolution.”');
    expect(passedItems[0].status).toBe('approved');
  });

  it('5. View Proof Section button immediately shifts to Proof', async () => {
    const onShiftToProof = vi.fn();

    await act(async () => {
      root.render(
        <ImportTestimonialsHub
          workspaceId="test-ws"
          workspaceName="Test Workspace"
          onShiftToProof={onShiftToProof}
        />
      );
    });

    const viewProofBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('View Proof Section')
    );
    expect(viewProofBtn).toBeDefined();

    await act(async () => {
      viewProofBtn?.click();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(onShiftToProof).toHaveBeenCalledWith([]);
  });
});
