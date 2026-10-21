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

    // Fillable Name and Designation inputs, locked Campaign & Date
    const nameInput = container.querySelector('[data-testid="input-customer-name"]') as HTMLInputElement;
    const campaignEl = container.querySelector('[data-testid="locked-campaign"]');
    const designationInput = container.querySelector('[data-testid="input-customer-designation"]') as HTMLInputElement;
    const dateEl = container.querySelector('[data-testid="locked-date"]');

    expect(nameInput?.value).toBe('Rahul Sharma');
    expect(campaignEl?.textContent).toBe('Q4 Product Launch');
    expect(designationInput?.value).toBe('Product Lead');
    expect(dateEl?.textContent).toBe('10/18/2026');
    expect(container.textContent).toContain('Designation:');
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

    // Verify space-saving minimal grade scale legend
    const scaleLegend = container.querySelector('[data-testid="matrix-scale-legend"]');
    expect(scaleLegend).not.toBeNull();
    expect(scaleLegend?.textContent).toContain('Scale:');
    expect(scaleLegend?.textContent).toContain('1 (Very Bad)');
    expect(scaleLegend?.textContent).toContain('5 (Excellent)');

    // Strict single-select radio behavior: Click row 0 col 2 (Good)
    const matrixBtn = container.querySelector('[data-testid="matrix-check-0-2"]') as HTMLButtonElement;
    await act(async () => {
      matrixBtn.click();
    });
    expect(matrixBtn.getAttribute('aria-checked')).toBe('true');

    // Clicking again should NOT deselect (strict radio behavior)
    await act(async () => {
      matrixBtn.click();
    });
    expect(matrixBtn.getAttribute('aria-checked')).toBe('true');

    // Clicking another option in same row switches selection and morphs scale pill
    const matrixBtn4 = container.querySelector('[data-testid="matrix-check-0-4"]') as HTMLButtonElement;
    await act(async () => {
      matrixBtn4.click();
    });
    expect(matrixBtn4.getAttribute('aria-checked')).toBe('true');
    expect(matrixBtn.getAttribute('aria-checked')).toBe('false');

    // Verify dynamic scale badge morphed to Score 5: Excellent
    expect(scaleLegend?.textContent).toContain('Score 5:');
    expect(scaleLegend?.textContent).toContain('Excellent');

    // Verify row 0 shows the interactive micro-badge
    expect(container.querySelector('[data-testid="matrix-question-0"]')?.parentElement?.textContent).toContain('5/5 · Excellent');

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
    const previewName = container.querySelector('[data-testid="input-customer-name"]') as HTMLInputElement;
    expect(previewName?.value).toBe('Priya Patel');

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

    // Shows high-growth thank you screen with reward cross-sell and viral loop
    expect(container.textContent).toContain('Thank You for Your Feedback!');
    expect(container.textContent).toContain('Exclusive Thank You Reward');
    expect(container.textContent).toContain('REVIEW15');
    expect(container.textContent).toContain('Collect reviews like this for your business');
    expect(container.textContent).toContain('Create Your Free PandaPraise Workspace');
  });

  it('6. Video recording toggle enables in-browser video review mode and prompt chips', async () => {
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

    // Check mode buttons exist
    const writtenBtn = container.querySelector('[data-testid="toggle-written-review"]') as HTMLButtonElement;
    const videoBtn = container.querySelector('[data-testid="toggle-video-review"]') as HTMLButtonElement;
    expect(writtenBtn).not.toBeNull();
    expect(videoBtn).not.toBeNull();
    expect(videoBtn.textContent).toContain('Video (+2x Perk)');

    // Click prompt chip
    const promptSolveBtn = container.querySelector('[data-testid="prompt-chip-solve"]') as HTMLButtonElement;
    expect(promptSolveBtn).not.toBeNull();
    await act(async () => {
      promptSolveBtn.click();
    });
    const textarea = container.querySelector('[data-testid="input-improvement-text"]') as HTMLTextAreaElement;
    expect(textarea.value).toContain("It solved our team's main bottleneck.");

    // Switch to Video mode
    await act(async () => {
      videoBtn.click();
    });

    // Unified video recorder container should be visible
    expect(container.querySelector('[data-testid="unified-video-recorder-container"]')).not.toBeNull();
    expect(container.textContent).toContain('Browser Video Recorder (+2x Perk)');

    // Submit form in video mode
    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'video',
      })
    );
  });

  it('7. Submitter can edit Name and Designation directly on the form and submit', async () => {
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

    const nameInput = container.querySelector('[data-testid="input-customer-name"]') as HTMLInputElement;
    const designationInput = container.querySelector('[data-testid="input-customer-designation"]') as HTMLInputElement;
    const textarea = container.querySelector('[data-testid="input-improvement-text"]') as HTMLTextAreaElement;

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(nameInput, 'Amitabh Verma');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputSetter?.call(designationInput, 'Senior Cloud Architect');
      designationInput.dispatchEvent(new Event('input', { bubbles: true }));
      designationInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeTextareaSetter?.call(textarea, 'Incredible reliability and throughput.');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        authorName: 'Amitabh Verma',
        authorRole: 'Senior Cloud Architect',
        improvementText: 'Incredible reliability and throughput.',
      })
    );
  });
});
