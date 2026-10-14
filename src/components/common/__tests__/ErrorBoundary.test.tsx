// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ErrorBoundary } from '../ErrorBoundary';

const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test explosive crash');
  }
  return <div>Healthy Component</div>;
};

describe('ErrorBoundary Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('1. Renders children normally when no error occurs', async () => {
    await act(async () => {
      root.render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={false} />
        </ErrorBoundary>
      );
    });

    expect(container.textContent).toContain('Healthy Component');
  });

  it('2. Catches error and displays branded recovery UI instead of white screen', async () => {
    await act(async () => {
      root.render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );
    });

    expect(container.textContent).not.toContain('Healthy Component');
    expect(container.textContent).toContain('Panda Praise is updating');
    expect(container.textContent).toContain('Reload Application');
  });
});
