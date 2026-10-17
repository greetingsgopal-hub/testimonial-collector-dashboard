import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BlobCard } from '../BlobCard';

describe('BlobCard Component', () => {
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

  it('renders header and children correctly', async () => {
    await act(async () => {
      root.render(
        <BlobCard
          header={<h3 data-testid="blob-header">Card Title</h3>}
        >
          <p data-testid="blob-content">Card description text</p>
        </BlobCard>
      );
    });

    const header = container.querySelector('[data-testid="blob-header"]');
    const content = container.querySelector('[data-testid="blob-content"]');

    expect(header).not.toBeNull();
    expect(header?.textContent).toBe('Card Title');
    expect(content).not.toBeNull();
    expect(content?.textContent).toBe('Card description text');
  });

  it('applies custom headerHeight and className', async () => {
    await act(async () => {
      root.render(
        <BlobCard
          headerHeight={280}
          className="custom-blob-card"
        >
          <div>Body</div>
        </BlobCard>
      );
    });

    const rootWrapper = container.querySelector('.custom-blob-card');
    expect(rootWrapper).not.toBeNull();

    const headerContainer = container.querySelector('[style*="height: 280px"]');
    expect(headerContainer).not.toBeNull();
  });
});
