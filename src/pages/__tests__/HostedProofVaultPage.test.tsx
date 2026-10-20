import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HostedProofVaultPage } from '../HostedProofVaultPage';

describe('HostedProofVaultPage (/p/:slug)', () => {
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
    vi.clearAllMocks();
  });

  it('renders Deal-Closer CTA bar with rating badge and CTA button', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/p/acme-corp']}>
          <Routes>
            <Route path="/p/:slug" element={<HostedProofVaultPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toContain('5.0');
    expect(text).toMatch(/Verified Social Proof/i);

    const ctaLink = container.querySelector('a[href*="wa.me"], a[href*="http"]');
    expect(ctaLink).not.toBeNull();
    expect(container.textContent).toMatch(/Chat on WhatsApp|Get Started|Hire Us/i);
  });

  it('renders verified proof cards with source platform pills', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/p/supabase']}>
          <Routes>
            <Route path="/p/:slug" element={<HostedProofVaultPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toMatch(/Reddit|HackerNews|GoogleNews|Verified/i);
  });

  it('renders sticky viral loop footer back to PandaPraise', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/p/supabase']}>
          <Routes>
            <Route path="/p/:slug" element={<HostedProofVaultPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toMatch(/Auto-Harvested by PandaPraise/i);
    expect(text).toMatch(/Hunt your own praise & poach competitor leads free/i);
  });
});
