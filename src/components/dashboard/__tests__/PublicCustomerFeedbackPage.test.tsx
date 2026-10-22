// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import PublicCustomerFeedbackPage from '../PublicCustomerFeedbackPage';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock Firestore
const mockAddDoc = vi.fn(() => Promise.resolve({ id: 'test_doc_public_1' }));
const mockGetDoc = vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  setDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn(() => ({})),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  serverTimestamp: vi.fn(() => '2026-10-18T00:00:00Z'),
}));

describe('PublicCustomerFeedbackPage Standalone Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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

  it('1. Renders the constant review template with prefilled locked metadata', async () => {
    await act(async () => {
      root.render(<PublicCustomerFeedbackPage workspaceSlug="onionbananaalo" />);
    });

    expect(container.querySelector('[data-testid="template-brand-pill"]')?.textContent).toBe('onionbananaalo');
    expect((container.querySelector('[data-testid="input-customer-name"]') as HTMLInputElement)?.value).toBe('Rahul Sharma');
    expect(container.querySelector('[data-testid="locked-campaign"]')?.textContent).toBe('Q4 Product Launch');
  });

  it('2. Submitting feedback transitions to the polished success screen with viral loop and eliminates caret', async () => {
    await act(async () => {
      root.render(<PublicCustomerFeedbackPage workspaceSlug="onionbananaalo" />);
    });

    const textarea = container.querySelector('[data-testid="input-improvement-text"]') as HTMLTextAreaElement;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeTextareaSetter?.call(textarea, 'Outstanding collaboration and delivery!');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        workspaceId: 'onionbananaalo',
        content: 'Outstanding collaboration and delivery!',
        status: 'approved',
      })
    );

    // Verify success screen elements
    expect(container.textContent).toContain('Thank You for Your Feedback!');
    expect(container.textContent).toContain('Collect reviews like this for your business');
    expect(container.textContent).toContain('Create Your Free PandaPraise Workspace');

    // Verify that form inputs and textareas are completely unmounted (no caret bug)
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });
});
