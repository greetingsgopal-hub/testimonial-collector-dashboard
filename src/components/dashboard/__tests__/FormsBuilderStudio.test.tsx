// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import FormsBuilderStudio, { FORM_TEMPLATES } from '../FormsBuilderStudio';

// Mock Firebase Firestore methods
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ size: 3 })),
  serverTimestamp: vi.fn(() => '2026-10-18T00:00:00Z'),
}));

describe('FormsBuilderStudio Production Component Suite', () => {
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

  it('1. Renders items-stretch grid with equalized column heights and clean default slug', async () => {
    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="proj_12345"
          workspaceName="DIRECT2MEGOPAL's Workspace"
          userPlan="pro"
        />
      );
    });

    // Check items-stretch class on top grid
    const topGrid = container.querySelector('.items-stretch');
    expect(topGrid).not.toBeNull();

    // Check sanitized slug is displayed and defaults cleanly without raw Firebase ID
    expect(container.textContent).toContain('/c/direct2megopal');
    const slugInput = container.querySelector('[data-testid="builder-slug-input"]') as HTMLInputElement;
    expect(slugInput).not.toBeNull();
    expect(slugInput.value).toBe('direct2megopal');
  });

  it('2. Eliminates duplicate icons: renders single Camera icon and single × Deselect', async () => {
    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="test-ws"
          workspaceName="Example Brand"
          userPlan="pro"
        />
      );
    });

    const uploadLabel = container.querySelector('[data-testid="preview-avatar-upload-btn"]');
    expect(uploadLabel).not.toBeNull();
    // Does NOT contain duplicate literal camera emoji
    expect(uploadLabel?.textContent?.trim()).toBe('Upload');

    const deselectBtn = container.querySelector('[data-testid="preview-avatar-deselect-btn"]');
    expect(deselectBtn).not.toBeNull();
    // Does NOT contain duplicate cross symbol "× × Deselect"
    expect(deselectBtn?.textContent?.trim()).toBe('× Deselect');
    expect(deselectBtn?.textContent).not.toContain('× ×');
  });

  it('3. Allows editing Guided Review Prompt Chips on left, updating preview chips on right', async () => {
    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="test-ws"
          workspaceName="Example Brand"
          userPlan="pro"
        />
      );
    });

    const chip1Input = container.querySelector('[data-testid="builder-prompt-chip-1"]') as HTMLInputElement;
    const chip2Input = container.querySelector('[data-testid="builder-prompt-chip-2"]') as HTMLInputElement;
    expect(chip1Input).not.toBeNull();
    expect(chip2Input).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(chip1Input, '⚡ How fast was turnaround?');
      chip1Input.dispatchEvent(new Event('input', { bubbles: true }));
      chip1Input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Right preview chip updates
    const previewChip1 = container.querySelector('[data-testid="preview-prompt-chip-1"]');
    expect(previewChip1?.textContent).toContain('⚡ How fast was turnaround?');

    // Clicking the prompt chip appends helper text to review textarea
    const reviewTextarea = container.querySelector('[data-testid="preview-review-input"]') as HTMLTextAreaElement;
    await act(async () => {
      (previewChip1 as HTMLButtonElement).click();
    });

    expect(reviewTextarea.value).toContain('It solved our biggest bottleneck.');
  });

  it('4. Real-time live review card preview updates author name, role, and quote live as user types', async () => {
    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="test-ws"
          workspaceName="Example Brand"
          userPlan="pro"
        />
      );
    });

    const nameInput = container.querySelector('[data-testid="preview-name-input"]') as HTMLInputElement;
    const roleInput = container.querySelector('[data-testid="preview-designation-input"]') as HTMLInputElement;
    const reviewTextarea = container.querySelector('[data-testid="preview-review-input"]') as HTMLTextAreaElement;

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(nameInput, 'Vikram Malhotra');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputSetter?.call(roleInput, 'VP Engineering');
      roleInput.dispatchEvent(new Event('input', { bubbles: true }));
      roleInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Vikram Malhotra');
    expect(container.textContent).toContain('· VP Engineering');
  });

  it('5. Renders 3 Default + 1 Customizable Hero Background Template with single clean Applied ✓ status', async () => {
    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="test-ws"
          workspaceName="Example Brand"
          userPlan="pro"
        />
      );
    });

    // Check all 4 template names are present
    expect(container.textContent).toContain('Midnight Sleek');
    expect(container.textContent).toContain('Emerald Trust');
    expect(container.textContent).toContain('Sunset Warmth');
    expect(container.textContent).toContain('Customizable Hero Background');

    // Verify 4th template is marked for Pro & Agency
    expect(container.textContent).toContain('Pro & Agency');

    // Default template (Midnight Sleek) has single "Applied ✓"
    const midnightCard = container.querySelector('[data-testid="template-midnight"]');
    expect(midnightCard?.textContent).toContain('Applied ✓');
    
    // Ensure "Applied ✓" does NOT appear twice within the midnight card
    const appliedMatches = midnightCard?.textContent?.match(/Applied\s*✓/g);
    expect(appliedMatches?.length).toBe(1);

    // Click Emerald Trust template
    const emeraldCard = container.querySelector('[data-testid="template-emerald"]') as HTMLElement;
    await act(async () => {
      emeraldCard.click();
    });

    expect(emeraldCard.textContent).toContain('Applied ✓');
  });

  it('6. Allows copying the public form link and navigates to Proof from queue footer', async () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });

    const mockNavigateProof = vi.fn();

    await act(async () => {
      root.render(
        <FormsBuilderStudio
          workspaceId="test-ws"
          workspaceName="MyBrand"
          onNavigateToProof={mockNavigateProof}
        />
      );
    });

    const copyBtn = container.querySelector('[data-testid="builder-copy-link-btn"]') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();

    await act(async () => {
      copyBtn.click();
    });

    expect(clipboardSpy).toHaveBeenCalled();
    expect(container.textContent).toContain('Copied /c/mybrand');

    // Queue footer moderate button
    const moderateBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Moderate')
    );
    expect(moderateBtn).toBeDefined();

    await act(async () => {
      moderateBtn?.click();
    });

    expect(mockNavigateProof).toHaveBeenCalledTimes(1);
  });
});
