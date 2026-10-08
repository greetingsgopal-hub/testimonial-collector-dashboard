import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicCollectorPage } from '../PublicCollectorPage';

// Mock storage
const mockFormConfig = {
  id: 'form_123',
  projectId: 'proj_123',
  publicSlug: 'acme-corp',
  title: 'Share your feedback with Acme Corp',
  description: 'We value your honest feedback.',
  isActive: true,
  allowVideo: false,
  settings: {
    brandName: 'Acme Corp',
    brandColor: '#6701e6',
    requireRating: true,
  },
  createdAt: '2026-01-01',
};

const mockProject = {
  id: 'proj_123',
  name: 'Acme Corp',
  slug: 'acme-corp',
};

vi.mock('../../lib/storage', () => ({
  storage: {
    getCollectionFormBySlug: vi.fn().mockImplementation((slug: string) => {
      if (slug === 'acme-corp') {
        return Promise.resolve({ form: mockFormConfig, project: mockProject });
      }
      return Promise.resolve(null);
    }),
    createReview: vi.fn().mockResolvedValue({ id: 'rev_123' }),
    evaluateAutoApproval: vi.fn().mockResolvedValue(undefined),
  },
  getActiveBackendInfo: () => ({ type: 'demo', isOnline: true }),
}));

describe('PublicCollectorPage CRO Single-Page Form Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it('1. Renders the unified single-step form immediately without forcing a separate continue step', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/c/acme-corp']}>
          <Routes>
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Should display the unified form directly
    const formElement = container.querySelector('form');
    expect(formElement).not.toBeNull();

    // The testimonial textarea should be present directly on landing
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    // Should NOT have the old gate continue button "Continue" or "Aage Badhein"
    const continueBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Continue' || b.textContent?.trim() === 'Aage Badhein'
    );
    expect(continueBtn).toBeUndefined();
  });

  it('2. Rationalizes trust badges: keeps one crisp indicator and removes the heavy 3-seal cluster', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/c/acme-corp']}>
          <Routes>
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Reassurance copy
    expect(container.textContent).toContain('Takes less than 30 seconds');
    expect(container.textContent).toContain('No login required');

    // Should NOT have the old 3-pillar seals cluster
    expect(container.textContent).not.toContain('Zero Financial Ask');
    expect(container.textContent).not.toContain('256-bit SSL');
  });

  it('3. Live Preview Card updates in real time with form inputs', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/c/acme-corp']}>
          <Routes>
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const nameInput = container.querySelector('input[placeholder*="Rivera"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    expect(nameInput).not.toBeNull();
    expect(textarea).not.toBeNull();

    await act(async () => {
      const nativeInputSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputSetter?.call(nameInput, 'John Doe');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeTextareaSetter?.call(textarea, 'Incredible tool that revolutionized our workflow!');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Live preview should show John Doe
    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('Incredible tool that revolutionized our workflow!');
  });

  it('4. Renders prominent thumb-friendly submit button with Hinglish support', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/c/acme-corp?lang=hi']}>
          <Routes>
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const submitBtn = container.querySelector('#submit-testimonial-btn');
    expect(submitBtn).not.toBeNull();
    expect(submitBtn?.textContent).toContain('Review Bhejein 🚀');
  });
});
