// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import FormBuilderStudio, {
  ConstantReviewFeedbackTemplate,
  PublicCustomerFeedbackPage,
  DEFAULT_FORM_TEXTS,
  CustomerFormSubmission,
} from '../ReviewFeedbackFormSystem';

// Mock Firestore
const mockAddDoc = vi.fn(() => Promise.resolve({ id: 'test_doc_1' }));
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

describe('ReviewFeedbackFormSystem Production Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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
  });

  it('1. ConstantReviewFeedbackTemplate renders constant structure: header, vector icon, emoji bar, matrix, and open feedback lines', async () => {
    const dummySubmission: CustomerFormSubmission = {
      meta1Value: 'Alice Chen',
      meta2Value: 'Summer Campaign',
      meta3Value: 'Marketing VP',
      meta4Value: '2026-10-18',
      selectedEmojiIndex: 0,
      matrixRatings: [4, 4, 3, 4],
      openFeedbackText: 'Exceptional service and quick delivery.',
    };
    const mockChangeSubmission = vi.fn();

    await act(async () => {
      root.render(
        <ConstantReviewFeedbackTemplate
          texts={DEFAULT_FORM_TEXTS}
          submission={dummySubmission}
          onChangeSubmission={mockChangeSubmission}
          showSubmitButton={true}
        />
      );
    });

    // Constant vector illustration
    const vectorSvg = container.querySelector('[data-testid="constant-vector-illustration"]');
    expect(vectorSvg).not.toBeNull();

    // Brand pill & contact email
    expect(container.querySelector('[data-testid="template-brand-pill"]')?.textContent).toBe('Larana, Inc.');
    expect(container.querySelector('[data-testid="template-contact-email"]')?.textContent).toBe('hello@reallygreatsite.com');

    // 4 metadata field inputs with dashed border style
    expect(container.querySelector('[data-testid="meta-label-1"]')?.textContent).toContain('Name:');
    expect(container.querySelector('[data-testid="meta-label-2"]')?.textContent).toContain('Campaign:');
    expect(container.querySelector('[data-testid="meta-label-3"]')?.textContent).toContain('Client:');
    expect(container.querySelector('[data-testid="meta-label-4"]')?.textContent).toContain('Date:');

    // Emoji satisfaction selector (5 emoji circles)
    for (let i = 0; i < 5; i++) {
      expect(container.querySelector(`[data-testid="emoji-btn-${i}"]`)).not.toBeNull();
    }

    // 4x5 checkbox matrix
    for (let r = 0; r < 4; r++) {
      expect(container.querySelector(`[data-testid="matrix-question-${r}"]`)).not.toBeNull();
      for (let c = 0; c < 5; c++) {
        expect(container.querySelector(`[data-testid="matrix-check-${r}-${c}"]`)).not.toBeNull();
      }
    }

    // Open feedback textarea with repeating dashed lines
    const textarea = container.querySelector('[data-testid="input-open-feedback"]') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe('Exceptional service and quick delivery.');
  });

  it('2. FormBuilderStudio edits variable texts on the left and updates the right preview in real time', async () => {
    await act(async () => {
      root.render(
        <FormBuilderStudio
          workspaceId="larana-inc"
          workspaceName="Larana Studio"
        />
      );
    });

    const brandInput = container.querySelector('[data-testid="input-brand-pill"]') as HTMLInputElement;
    const emailInput = container.querySelector('[data-testid="input-contact-email"]') as HTMLInputElement;
    const title1Input = container.querySelector('[data-testid="input-title-line-1"]') as HTMLInputElement;

    expect(brandInput).not.toBeNull();
    expect(emailInput).not.toBeNull();
    expect(title1Input).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(brandInput, 'Acme Global');
      brandInput.dispatchEvent(new Event('input', { bubbles: true }));
      brandInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputSetter?.call(emailInput, 'contact@acmeglobal.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputSetter?.call(title1Input, 'Client');
      title1Input.dispatchEvent(new Event('input', { bubbles: true }));
      title1Input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify right preview updated
    const previewBrandPill = container.querySelector('[data-testid="template-brand-pill"]');
    const previewEmail = container.querySelector('[data-testid="template-contact-email"]');
    const previewTitle = container.querySelector('[data-testid="template-title"]');

    expect(previewBrandPill?.textContent).toBe('Acme Global');
    expect(previewEmail?.textContent).toBe('contact@acmeglobal.com');
    expect(previewTitle?.textContent).toContain('Client');
  });

  it('3. FormBuilderStudio allows copying customer share link and resetting texts', async () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });

    await act(async () => {
      root.render(
        <FormBuilderStudio
          workspaceId="besteample"
          workspaceName="Larana, Inc."
        />
      );
    });

    const copyBtn = container.querySelector('[data-testid="builder-copy-share-btn"]') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();

    await act(async () => {
      copyBtn.click();
    });

    expect(mockSetDoc).toHaveBeenCalled();
    expect(clipboardSpy).toHaveBeenCalled();
    expect(container.textContent).toContain('Share Link Copied!');

    // Reset button
    const resetBtn = container.querySelector('[data-testid="builder-reset-btn"]') as HTMLButtonElement;
    await act(async () => {
      resetBtn.click();
    });
    expect(container.querySelector('[data-testid="template-brand-pill"]')?.textContent).toBe('Larana, Inc.');
  });

  it('4. PublicCustomerFeedbackPage submits customer response to Firestore testimonials collection', async () => {
    await act(async () => {
      root.render(
        <PublicCustomerFeedbackPage workspaceSlug="larana-inc" />
      );
    });

    const nameInput = container.querySelector('[data-testid="input-meta-1"]') as HTMLInputElement;
    const clientInput = container.querySelector('[data-testid="input-meta-3"]') as HTMLInputElement;
    const feedbackTextarea = container.querySelector('[data-testid="input-open-feedback"]') as HTMLTextAreaElement;
    const submitBtn = container.querySelector('[data-testid="template-submit-btn"]') as HTMLButtonElement;

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(nameInput, 'Marcus Aurelius');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputSetter?.call(clientInput, 'Rome Productions');
      clientInput.dispatchEvent(new Event('input', { bubbles: true }));
      clientInput.dispatchEvent(new Event('change', { bubbles: true }));

      const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeTextareaSetter?.call(feedbackTextarea, 'Outstanding clarity and craftsmanship in the final delivery.');
      feedbackTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      feedbackTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Click submit
    await act(async () => {
      submitBtn.click();
    });

    expect(mockAddDoc).toHaveBeenCalled();
    const callArgs = mockAddDoc.mock.calls[0][1];
    expect(callArgs.authorName).toBe('Marcus Aurelius');
    expect(callArgs.authorRole).toContain('Rome Productions');
    expect(callArgs.content).toBe('Outstanding clarity and craftsmanship in the final delivery.');
    expect(callArgs.status).toBe('approved');
    expect(callArgs.rating).toBeGreaterThanOrEqual(1);
    expect(callArgs.rating).toBeLessThanOrEqual(5);

    // Shows Thank You celebration screen
    expect(container.textContent).toContain('Thank You for Your Feedback!');
  });
});
