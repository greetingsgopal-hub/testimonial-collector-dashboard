import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../localStorageAdapter';
import { storage } from '../index';
import { ReviewInput } from '../../../types';

describe('Storage bulkCreateReviews implementation', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('pandapraise_demo_mode', 'true');
  });

  it('bulk creates reviews atomically in LocalStorageAdapter', async () => {
    const adapter = new LocalStorageAdapter();
    const reviews: ReviewInput[] = [
      {
        projectId: 'test_proj',
        name: 'User 1',
        content: 'Review 1 content is great and long enough.',
        rating: 5,
        source: 'csv',
        status: 'approved',
      },
      {
        projectId: 'test_proj',
        name: 'User 2',
        content: 'Review 2 content is also great and long.',
        rating: 4,
        source: 'csv',
        status: 'approved',
      },
    ];

    const result = await adapter.bulkCreateReviews(reviews, 'test_proj');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBe('User 1');
    expect(result[0].status).toBe('approved');

    const loaded = await adapter.getReviews('test_proj');
    expect(loaded).toHaveLength(2);
  });

  it('delegates bulkCreateReviews through the main storage router', async () => {
    const reviews: ReviewInput[] = [
      {
        projectId: 'router_proj',
        name: 'Jane Doe',
        content: 'Testimonial created through storage router.',
        rating: 5,
        source: 'csv',
      },
    ];

    const result = await storage.bulkCreateReviews!(reviews, 'router_proj');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jane Doe');
    expect(result[0].projectId).toBe('router_proj');
  });
});
