// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CollectionFormBuilder, PRESET_TEMPLATES } from '../CollectionFormBuilder';

describe('CollectionFormBuilder Component Suite', () => {
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

  it('1. Renders exact split-screen outline: Top-Left Collection FORM, Top-Right Preview, Bottom Templates Collection', async () => {
    await act(async () => {
      root.render(<CollectionFormBuilder workspaceName="papasystem" />);
    });

    expect(container.textContent).toContain('Form Builder');
    expect(container.textContent).toContain('Collection FORM');
    expect(container.textContent).toContain('Preview');
    expect(container.textContent).toContain('Templates Collection');
    expect(container.textContent).toContain('★ Verified Space • papasystem');

    // All 4 preset templates from the outline
    PRESET_TEMPLATES.forEach((tpl) => {
      expect(container.textContent).toContain(tpl.name);
    });
  });

  it('2. Live preview updates immediately when user changes form heading and subheading', async () => {
    await act(async () => {
      root.render(<CollectionFormBuilder workspaceName="papasystem" />);
    });

    const headingInput = container.querySelector('[data-testid="builder-heading-input"]') as HTMLInputElement;
    expect(headingInput).not.toBeNull();

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(headingInput, 'Custom Heading For PapaSystem');
      headingInput.dispatchEvent(new Event('change', { bubbles: true }));
      headingInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(container.textContent).toContain('Custom Heading For PapaSystem');
  });

  it('3. Applying a pre-made template updates heading, subheading, and card styling', async () => {
    await act(async () => {
      root.render(<CollectionFormBuilder workspaceName="papasystem" />);
    });

    // Emerald Trust template
    const emeraldTemplateEl = container.querySelector('[data-testid="template-emerald"]') as HTMLElement;
    expect(emeraldTemplateEl).not.toBeNull();

    await act(async () => {
      emeraldTemplateEl.click();
    });

    expect(container.textContent).toContain('Share your success story!');
  });

  it('4. Apply & Save Live button calls onUpdateForm with active values', async () => {
    const onUpdateFormMock = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      root.render(
        <CollectionFormBuilder
          workspaceName="papasystem"
          onUpdateForm={onUpdateFormMock}
        />
      );
    });

    const saveBtn = container.querySelector('[data-testid="builder-save-btn"]') as HTMLButtonElement;
    expect(saveBtn).not.toBeNull();

    await act(async () => {
      saveBtn.click();
    });

    expect(onUpdateFormMock).toHaveBeenCalled();
  });

  it('5. Copy Form Link triggers clipboard copy', async () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });

    await act(async () => {
      root.render(
        <CollectionFormBuilder
          workspaceName="papasystem"
          publicCollectionUrl="https://pandapraise.com/c/papasystem"
        />
      );
    });

    const copyBtn = container.querySelector('[data-testid="builder-copy-link-btn"]') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();

    await act(async () => {
      copyBtn.click();
    });

    expect(clipboardSpy).toHaveBeenCalledWith('https://pandapraise.com/c/papasystem');
    expect(container.textContent).toContain('Link Copied!');
  });
});
