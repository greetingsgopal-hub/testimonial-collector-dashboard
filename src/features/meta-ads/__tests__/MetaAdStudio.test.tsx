import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MetaAdStudio } from '../components/MetaAdStudio';

describe('MetaAdStudio Component', () => {
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
  });

  it('renders initial state with sample review and generate button', async () => {
    await act(async () => {
      root.render(
        <MetaAdStudio 
          sampleReviewText="Fabric was super soft and COD delivery arrived in 2 days."
          customerName="Kavita R."
          productTitle="Handloom Cotton Saree"
        />
      );
    });

    expect(container.textContent).toContain('Review-to-Meta-Ad Creative Generator');
    expect(container.textContent).toContain('Handloom Cotton Saree');
    expect(container.textContent).toContain('Kavita R.');
    expect(container.textContent).toContain('Fabric was super soft and COD delivery arrived in 2 days.');
    expect(container.textContent).toContain('⚡ Generate 3 Meta Ad Variations');
  });

  it('generates 3 ad variations with pattern hooks, primary ad copy, and CTA buttons on click', async () => {
    await act(async () => {
      root.render(
        <MetaAdStudio 
          sampleReviewText="Fabric was super soft and COD delivery arrived in 2 days."
          customerName="Kavita R."
          productTitle="Handloom Cotton Saree"
        />
      );
    });

    const genBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Generate 3 Meta Ad Variations')
    );
    expect(genBtn).toBeTruthy();

    await act(async () => {
      genBtn?.click();
    });

    expect(container.textContent).toContain('Variation 1');
    expect(container.textContent).toContain('Variation 2');
    expect(container.textContent).toContain('Variation 3');
    expect(container.textContent).toContain('Pattern Hook');
    expect(container.textContent).toContain('Primary Ad Copy');
    expect(container.textContent).toContain('CTA Button:');
    expect(container.textContent).toContain('Copy Ad Bundle 📋');
  });
});
