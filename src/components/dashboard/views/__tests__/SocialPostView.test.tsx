// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { SocialPostView } from '../SocialPostView';
import { Review } from '../../../../types';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'proj_social_1', name: 'Social Pulse', slug: 'social-pulse' },
  }),
}));

vi.mock('../../../../lib/socialClient', () => ({
  socialClient: {
    getStatus: vi.fn().mockResolvedValue({
      connections: {
        linkedin: { connected: true, accountName: 'social_founder' },
        twitter: { connected: false },
        facebook: { connected: false },
        instagram: { connected: false },
      },
      publications: [],
    }),
    publish: vi.fn().mockResolvedValue({ success: true, platform: 'linkedin' }),
    initOAuth: vi.fn().mockResolvedValue({ authUrl: 'https://oauth.example.com' }),
  },
}));

describe('SocialPostView Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockReviews: Review[] = [
    {
      id: 'rev_1',
      name: 'Sarah Connor',
      rating: 5,
      status: 'approved',
      content: 'Antigravity makes workflow blazing fast!',
      createdAt: '2026-02-01T12:00:00Z',
    },
    {
      id: 'rev_2',
      name: 'John Connor',
      rating: 5,
      status: 'approved',
      content: 'Top tier customer proof tool.',
      createdAt: '2026-02-02T12:00:00Z',
    },
  ];

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

  it('1. Renders Post on internet header, connected channels, and approved reviews', async () => {
    await act(async () => {
      root.render(<SocialPostView reviews={mockReviews} />);
    });

    expect(container.textContent).toContain('Post on internet');
    expect(container.textContent).toContain('Choose Broadcast Destinations');
    expect(container.textContent).toContain('LinkedIn');
    expect(container.textContent).toContain('X (Twitter)');
    expect(container.textContent).toContain('Sarah Connor');
    expect(container.textContent).toContain('John Connor');
  });

  it('2. Supports select tick filter and updating 1-click broadcast button', async () => {
    await act(async () => {
      root.render(<SocialPostView reviews={mockReviews} />);
    });

    const publishBtn = container.querySelector('[data-testid="publish-social-btn"]');
    expect(publishBtn).not.toBeNull();
    expect(publishBtn?.textContent).toContain('Select Testimonials to Post');

    // Select the first review via checkbox
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Click first review card
    const firstReviewCard = container.querySelector('[data-testid="review-card-rev_1"]') as HTMLElement;
    expect(firstReviewCard).not.toBeNull();
    await act(async () => {
      firstReviewCard.click();
    });

    // Now button should indicate queued testimonials
    const updatedBtn = container.querySelector('[data-testid="publish-social-btn"]');
    expect(updatedBtn?.textContent).toContain('1 Selected');
  });
});
