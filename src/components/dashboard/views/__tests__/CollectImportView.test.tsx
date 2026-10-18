// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CollectImportView } from '../CollectImportView';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_1', name: 'Test Flow', slug: 'test-flow' },
    collectionForm: {
      id: 'form_1',
      publicSlug: 'test-flow',
      title: 'Feedback',
      isActive: true,
      allowVideo: true,
    },
  }),
}));

vi.mock('../../../../pages/ImportPage', () => ({
  ImportPage: () => <div data-testid="mock-import-page">Import Page Content</div>,
}));

describe('CollectImportView Suite', () => {
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

  it('1. Renders segmented sub-tab switcher with Collection Form and Import Praise', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <CollectImportView
            onConfigureForm={vi.fn()}
            onViewProof={vi.fn()}
            reviews={[]}
          />
        </MemoryRouter>
      );
    });

    const switcher = container.querySelector('[data-testid="collect-import-switcher"]');
    expect(switcher).not.toBeNull();
    expect(container.textContent).toContain('Collection Form');
    expect(container.textContent).toContain('Import Praise');
    expect(container.textContent).toContain('Form Builder');
    expect(container.textContent).toContain('Collection FORM');
    expect(container.textContent).toContain('Templates Collection');
  });

  it('2. Switches dynamically between Collection Form and Import Praise', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <CollectImportView
            onConfigureForm={vi.fn()}
            onViewProof={vi.fn()}
            reviews={[]}
          />
        </MemoryRouter>
      );
    });

    // Default is collect
    expect(container.querySelector('[data-testid="mock-import-page"]')).toBeNull();

    // Click Import
    const importBtn = container.querySelector('[data-testid="switch-to-import"]') as HTMLButtonElement;
    await act(async () => {
      importBtn.click();
    });

    expect(container.querySelector('[data-testid="mock-import-page"]')).not.toBeNull();

    // Click back to Collect
    const collectBtn = container.querySelector('[data-testid="switch-to-collect"]') as HTMLButtonElement;
    await act(async () => {
      collectBtn.click();
    });

    expect(container.querySelector('[data-testid="mock-import-page"]')).toBeNull();
  });
});
