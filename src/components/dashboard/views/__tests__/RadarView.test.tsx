import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { RadarView } from '../RadarView';

describe('RadarView Dashboard Command Center', () => {
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

  it('renders brand radar and competitor tracking inputs', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <RadarView
            workspaceId="ws_123"
            workspaceName="Acme Inc"
            brandSlug="acme-inc"
          />
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toMatch(/Radar & Lead Poacher/i);
    expect(text).toMatch(/Competitor Watchlist/i);
    expect(text).toMatch(/View Public Vault/i);
  });

  it('renders signals feed with poachable competitor leads and praise', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <RadarView
            workspaceId="ws_123"
            workspaceName="Acme Inc"
            brandSlug="acme-inc"
          />
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toMatch(/Poach Lead/i);
    expect(text).toMatch(/Praise/i);
  });

  it('allows toggling publish to hosted vault', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <RadarView
            workspaceId="ws_123"
            workspaceName="Acme Inc"
            brandSlug="acme-inc"
          />
        </MemoryRouter>
      );
    });

    const publishButtons = container.querySelectorAll('button[data-toggle-publish="true"]');
    expect(publishButtons.length).toBeGreaterThan(0);
  });
});
