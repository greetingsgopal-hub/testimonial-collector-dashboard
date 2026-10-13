import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { AnalyzeView } from '../AnalyzeView';
import { Review } from '../../../../types';

const mockReviews: Review[] = [
  {
    id: 'rev_1',
    projectId: 'p_1',
    name: 'Emma Watson',
    content: 'Panda Praise increased our checkout conversion rate dramatically!',
    rating: 5,
    status: 'approved',
    type: 'text',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'rev_2',
    projectId: 'p_1',
    name: 'David Byrne',
    content: 'Super easy to embed widgets and setup on Shopify.',
    rating: 5,
    status: 'approved',
    type: 'text',
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'rev_3',
    projectId: 'p_1',
    name: 'Chris Martin',
    content: 'Decent, but looking for more customization features.',
    rating: 3,
    status: 'pending',
    type: 'text',
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z',
  },
];

describe('AnalyzeView Conversion Funnel & Intelligence (Task 4.4)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders 5-stage conversion funnel and summary KPIs by default', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<AnalyzeView reviews={mockReviews} />);
    });

    expect(container.textContent).toContain('Growth & Customer Analytics');
    expect(container.textContent).toContain('Conversion Funnel');
    expect(container.textContent).toContain('Form Conversion Rate');
    expect(container.textContent).toContain('Approval Velocity');
    expect(container.textContent).toContain('Widget Impressions');
    expect(container.textContent).toContain('Viral Watermark CTR');

    // Funnel stage labels
    expect(container.textContent).toContain('Collector Page Views');
    expect(container.textContent).toContain('Testimonial Submissions');
    expect(container.textContent).toContain('Approved Testimonials');
    expect(container.textContent).toContain('Live Widget Impressions');
    expect(container.textContent).toContain('Viral Referral Clicks');

    // Growth recommendations
    expect(container.textContent).toContain('Embed on High-Intent Pages');
    expect(container.textContent).toContain('Automate Review Triggers');
    expect(container.textContent).toContain('PLG Viral Watermark Active');
  });

  it('switches to customer feedback intelligence tab when clicked', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<AnalyzeView reviews={mockReviews} />);
    });

    const feedbackTabBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Customer Feedback')
    );
    expect(feedbackTabBtn).toBeTruthy();

    await act(async () => {
      feedbackTabBtn?.click();
    });

    expect(container.textContent).toContain('Customer intelligence');
    expect(container.textContent).toContain('What customers love');
  });
});
