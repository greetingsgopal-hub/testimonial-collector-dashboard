import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { EmbedCodeModal } from '../EmbedCodeModal';

describe('EmbedCodeModal Component', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

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
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={false}
          onClose={vi.fn()}
          projectId="proj-123"
        />
      );
    });

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.textContent).toBe('');
  });

  it('renders modal with dynamic script tag when isOpen is true', () => {
    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={true}
          onClose={vi.fn()}
          projectId="proj-dynamic-xyz"
          widgetType="carousel"
          theme="dark"
          minRating={4}
        />
      );
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    // Verify dynamic script snippet includes project ID and widget.js
    const pre = dialog!.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('https://pandapraise.com/widget.js');
    expect(pre!.textContent).toContain('data-project-id="proj-dynamic-xyz"');
    expect(pre!.textContent).toContain('data-widget-type="carousel"');
    expect(pre!.textContent).toContain('data-theme="dark"');
  });

  it('copies snippet to clipboard and updates button state to copied for 2 seconds', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={true}
          onClose={vi.fn()}
          projectId="proj-copy-test"
        />
      );
    });

    const copyBtn = document.querySelector('[data-testid="copy-snippet-btn"]') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();
    expect(copyBtn.textContent).toContain('Copy Code');

    await act(async () => {
      copyBtn.click();
    });

    expect(writeTextMock).toHaveBeenCalled();
    expect(writeTextMock.mock.calls[0][0]).toContain('data-project-id="proj-copy-test"');
    expect(copyBtn.textContent).toContain('Copied');
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={true}
          onClose={onClose}
          projectId="proj-esc-test"
        />
      );
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal on backdrop', () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={true}
          onClose={onClose}
          projectId="proj-backdrop-test"
        />
      );
    });

    const backdrop = document.querySelector('[data-testid="modal-backdrop"]') as HTMLDivElement;
    expect(backdrop).not.toBeNull();

    act(() => {
      backdrop.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between platform guide tabs (WordPress, Shopify, React/Next.js)', async () => {
    act(() => {
      root.render(
        <EmbedCodeModal
          isOpen={true}
          onClose={vi.fn()}
          projectId="proj-tab-test"
        />
      );
    });

    // Default or initial tab
    expect(document.body.textContent).toContain('Webflow');

    // Click WordPress tab
    const wpTab = document.querySelector('[data-testid="tab-wordpress"]') as HTMLButtonElement;
    expect(wpTab).not.toBeNull();
    act(() => {
      wpTab.click();
    });
    expect(document.body.textContent).toContain('Custom HTML');
    expect(document.body.textContent).toContain('Gutenberg');

    // Click Shopify tab
    const shopifyTab = document.querySelector('[data-testid="tab-shopify"]') as HTMLButtonElement;
    expect(shopifyTab).not.toBeNull();
    act(() => {
      shopifyTab.click();
    });
    expect(document.body.textContent).toContain('theme.liquid');

    // Click React/Next.js tab
    const reactTab = document.querySelector('[data-testid="tab-react"]') as HTMLButtonElement;
    expect(reactTab).not.toBeNull();
    act(() => {
      reactTab.click();
    });
    expect(document.body.textContent).toContain('useEffect');
  });
});
