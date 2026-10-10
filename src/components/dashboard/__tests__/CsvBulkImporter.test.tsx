import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { CsvBulkImporter } from '../CsvBulkImporter';

// Mock storage
vi.mock('../../../lib/storage', () => ({
  storage: {
    bulkCreateReviews: vi.fn().mockResolvedValue([
      { id: 'rev_1', name: 'Alice', content: 'Super fast platform!', rating: 5 },
    ]),
  },
}));

describe('CsvBulkImporter Component', () => {
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

  it('renders upload dropzone and template download button', () => {
    act(() => {
      root.render(
        <CsvBulkImporter
          projectId="proj_test_123"
          ownerId="owner_user_abc"
          onSuccess={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain('Upload CSV Testimonials');
    expect(container.textContent).toContain('Download CSV Template');
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('provides sample template download trigger', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    act(() => {
      root.render(
        <CsvBulkImporter
          projectId="proj_test_123"
          ownerId="owner_user_abc"
          onSuccess={vi.fn()}
        />
      );
    });

    const templateBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Download CSV Template')
    );
    expect(templateBtn).toBeDefined();

    act(() => {
      templateBtn?.click();
    });

    expect(createObjectURL).toHaveBeenCalled();
  });
});
