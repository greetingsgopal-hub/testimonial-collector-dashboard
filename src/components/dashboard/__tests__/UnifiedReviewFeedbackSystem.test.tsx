// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import FormBuilderStudio, {
  UnifiedReviewFormRenderer,
  PublicCustomerFeedbackPage,
  DEFAULT_REVIEW_CONFIG,
} from '../UnifiedReviewFeedbackSystem';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock Firestore
const mockAddDoc = vi.fn(() => Promise.resolve({ id: 'test_doc_123' }));
const mockSetDoc = vi.fn(() => Promise.resolve());
const mockGetDoc = vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  collection: vi.fn(() => ({})),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  serverTimestamp: vi.fn(() => '2026-10-18T00:00:00Z'),
}));

describe('UnifiedReviewFeedbackSystem Production Suite', () => {
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

  it('1. UnifiedReviewFormRenderer renders forest green header, locked business details, and vector icon', async () => {
    await act(async () => {
      root.render(
        <UnifiedReviewFormRenderer
          config={DEFAULT_REVIEW_CONFIG}
          isLockedForEndUser={true}
        />
      );
    });

    // Brand pill & Title
    expect(container.querySelector('[data-testid="template-brand-pill"]')?.textContent).toBe('onionbananaalo');
    expect(container.textContent).toContain('Review');
    expect(container.textContent).toContain('Feedback');

    // Vector Icon
    expect(container.querySelector('[data-testid="constant-vector-icon"]')).not.toBeNull();

    // Locked pre-filled business details
    const nameEl = container.querySelector('[data-testid="locked-name"]');
    const campaignEl = container.querySelector('[data-testid="locked-campaign"]');
    const clientEl = container.querySelector('[data-testid="locked-client"]');
    const dateEl = container.querySelector('[data-testid="locked-date"]');

    expect(nameEl?.textContent).toBe('Rahul Sharma');
    expect(campaignEl?.textContent).toBe('Q4 Product Launch');
    expect(clientEl?.textContent).toBe('Product Lead');
    expect(dateEl?.textContent).toBe('10/18/2026');
  });

  it('2. Bilingual switcher toggles between English and Hinglish smoothly', async () => {
    await act(async () => {
      root.render(
        <UnifiedReviewFormRenderer
          config={DEFAULT_REVIEW_CONFIG}
          isLockedForEndUser={true}
        />
      );
    });

    const enBtn = container.querySelector('[data-testid="lang-switch-en"]') as HTMLButtonElement;
    const hiBtn = container.querySelector('[data-testid="lang-switch-hi"]') as HTMLButtonElement;

    // Initial state: English
    expect(container.querySelector('[data-testid="emoji-section-title"]')?.textContent).toBe(
      DEFAULT_REVIEW_CONFIG.sections.en.emojiTitle
    );
    expect(container.querySelector('[data-testid="matrix-section-title"]')?.textContent).toBe(
      DEFAULT_REVIEW_CONFIG.sections.en.matrixTitle
    );

    // Switch to Hinglish
    await act(async () => {
      hiBtn.click();
    });

    expect(container.querySelector('[data-testid="emoji-section-title"]')?.textContent).toBe(
      DEFAULT_REVIEW_CONFIG.sections.hi.emojiTitle
    );
    expect(container.querySelector('[data-testid="matrix-section-title"]')?.textContent).toBe(
      DEFAULT_REVIEW_CONFIG.sections.hi.matrixTitle
    );
    expect(container.querySelector('[data-testid="matrix-col-header-0"]')?.textContent).toBe('Bahut Bura');
    expect(container.querySelector('[data-testid="matrix-col-header-4"]')?.textContent).toBe('Shandar');

    // Switch back to English
    await act(async () => {
      enBtn.click();
    });

    expect(container.querySelector('[data-testid="emoji-section-title"]')?.textContent).toBe(
      DEFAULT_REVIEW_CONFIG.sections.en.emojiTitle
    );
    expect(container.querySelector('[data-testid="matrix-col-header-0"]')?.textContent).toBe('Very Bad');
    expect(container.querySelector('[data-testid="matrix-col-header-4"]')?.textContent).toBe('Excellent');
  });

  it('3. Form ticks emoji, matrix questions, and handles form submission', async () => {
    const mockSubmit = vi.fn();

    await act(async () => {
      root.render(
        <UnifiedReviewFormRenderer
          config={DEFAULT_REVIEW_CONFIG}
          isLockedForEndUser={true}
          onSubmitForm={mockSubmit}
        />
      );
    });

    // Select second emoji
    const emoji1 = container.querySelector('[data-testid="emoji-option-1"]') as HTMLButtonElement;
    await act(async () => {
      emoji1.click();
    });

    // Tick matrix rating for row 0 col 2 (Good)
    const matrixBtn = container.querySelector('[data-testid="matrix-check-0-2"]') as HTMLButtonElement;
    await act(async () => {
      matrixBtn.click();
    });

    // Fill improvement text using native descriptor
    const textarea = container.querySelector('[data-testid="input-improvement-text"]') as HTMLTextAreaElement;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeTextareaSetter?.call(textarea, 'Awesome delivery, great quality!');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Submit form
    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedEmojiIndex: 1,
        improvementText: 'Awesome delivery, great quality!',
      })
    );
  });

  it('4. FormBuilderStudio allows business editing of prefilled fields with real-time preview sync', async () => {
    await act(async () => {
      root.render(
        <FormBuilderStudio
          workspaceId="onionbananaalo"
          workspaceName="onionbananaalo"
        />
      );
    });

    const nameInput = container.querySelector('[data-testid="input-prefilled-name"]') as HTMLInputElement;
    const campaignInput = container.querySelector('[data-testid="input-prefilled-campaign"]') as HTMLInputElement;

    expect(nameInput).not.toBeNull();
    expect(campaignInput).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    // Edit Name
    await act(async () => {
      nativeInputSetter?.call(nameInput, 'Priya Patel');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify right-side live preview updated
    const previewName = container.querySelector('[data-testid="locked-name"]');
    expect(previewName?.textContent).toBe('Priya Patel');

    // Click Save & Publish
    const saveBtn = container.querySelector('[data-testid="builder-save-btn"]') as HTMLButtonElement;
    await act(async () => {
      saveBtn.click();
    });

    expect(mockSetDoc).toHaveBeenCalled();
  });

  it('5. PublicCustomerFeedbackPage submits customer feedback to Firestore testimonials collection as approved', async () => {
    await act(async () => {
      root.render(<PublicCustomerFeedbackPage workspaceSlug="onionbananaalo" />);
    });

    // Fill open text
    const textarea = container.querySelector('[data-testid="input-improvement-text"]') as HTMLTextAreaElement;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeTextareaSetter?.call(textarea, 'Everything was perfectly handled, thanks!');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Submit
    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        workspaceId: 'onionbananaalo',
        authorName: 'Rahul Sharma',
        content: 'Everything was perfectly handled, thanks!',
        status: 'approved',
        source: 'Review Feedback Form',
      })
    );

    // Shows thank you screen with viral loop
    expect(container.textContent).toContain('Thank You for Your Feedback!');
    expect(container.textContent).toContain('Run your own business?');
    expect(container.textContent).toContain('Claim Your Free PandaPraise Workspace');
  });
});
