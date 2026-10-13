import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { WallOfLovePage } from '../WallOfLovePage';
import { Review } from '../../types';

const sampleReviews: Review[] = [
  {
    id: 'rev_1',
    projectId: 'proj_1',
    name: 'Sarah Connor',
    role: 'CTO',
    company: 'Cyberdyne AI',
    content: 'PandaPraise completely transformed our website conversion. Incredible tool!',
    rating: 5,
    status: 'approved',
    type: 'text',
    source: 'pandapraise',
    tags: ['conversion', 'saas'],
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'rev_2',
    projectId: 'proj_1',
    name: 'Alex Miller',
    role: 'Growth Lead',
    company: 'Fintech Hub',
    content: 'Our signups doubled within two weeks of embedding the wall of love.',
    rating: 5,
    status: 'approved',
    type: 'text',
    source: 'pandapraise',
    tags: ['growth'],
    createdAt: '2026-03-02T12:00:00Z',
    updatedAt: '2026-03-02T12:00:00Z',
  },
];

vi.mock('../../lib/storage', () => ({
  storage: {
    getReviews: vi.fn().mockImplementation(() => Promise.resolve(sampleReviews)),
  },
}));

describe('WallOfLovePage Viral Actions & Case Study Export (Task 4.3)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders Wall of Love testimonials and 1-click viral share buttons', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <WallOfLovePage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Wall of Love');
    expect(container.textContent).toContain('Sarah Connor');
    expect(container.textContent).toContain('Cyberdyne AI');
    expect(container.textContent).toContain('Copy Quote');
    expect(container.textContent).toContain('Export Case Study');
  });

  it('opens AI Case Study export modal upon clicking Export Case Study', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <WallOfLovePage />
        </MemoryRouter>
      );
    });

    const exportBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Export Case Study')
    );
    expect(exportBtn).toBeTruthy();

    await act(async () => {
      exportBtn?.click();
    });

    expect(container.textContent).toContain('Customer Case Study Export');
    expect(container.textContent).toContain('Copy Markdown');
    expect(container.textContent).toContain('Download .md');
    expect(container.textContent).toContain('Cyberdyne AI');
  });
});
