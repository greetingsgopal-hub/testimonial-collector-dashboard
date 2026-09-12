import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats } from '../../types';
import { INITIAL_REVIEWS } from '../seedData';

const STORAGE_KEY = 'reviewvault_testimonials_v1';

export class LocalStorageAdapter implements StorageAdapter {
  name = 'Local Storage (In-Browser)';
  isCloud = false;

  private loadReviews(): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with default sample reviews
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
        return INITIAL_REVIEWS;
      }
      return JSON.parse(data) as Review[];
    } catch (e) {
      console.error('Failed to parse reviews from localStorage', e);
      return INITIAL_REVIEWS;
    }
  }

  private saveReviews(reviews: Review[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }

  async getReviews(): Promise<Review[]> {
    return this.loadReviews();
  }

  async getReviewById(id: string): Promise<Review | null> {
    const reviews = this.loadReviews();
    return reviews.find(r => r.id === id) || null;
  }

  async createReview(input: ReviewInput): Promise<Review> {
    const reviews = this.loadReviews();
    const newReview: Review = {
      ...input,
      id: 'rev-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      source: input.source || 'form',
      status: input.status || 'pending',
      isFeatured: input.isFeatured || false,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews);
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const reviews = this.loadReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Review with id ${id} not found`);
    }

    const updated: Review = {
      ...reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updated;
    this.saveReviews(reviews);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    const reviews = this.loadReviews();
    const filtered = reviews.filter(r => r.id !== id);
    if (filtered.length === reviews.length) {
      return false;
    }
    this.saveReviews(filtered);
    return true;
  }

  async getStats(): Promise<ReviewStats> {
    const reviews = this.loadReviews();
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved');
    const pending = reviews.filter(r => r.status === 'pending');
    const rejected = reviews.filter(r => r.status === 'rejected');
    const archived = reviews.filter(r => r.status === 'archived');
    const featured = reviews.filter(r => r.isFeatured);

    const sumRating = approved.length > 0 
      ? approved.reduce((acc, curr) => acc + curr.rating, 0)
      : 0;
    const averageRating = approved.length > 0 ? Number((sumRating / approved.length).toFixed(1)) : 0;

    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      }
    }

    return {
      total,
      averageRating,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      archivedCount: archived.length,
      featuredCount: featured.length,
      ratingBreakdown,
    };
  }

  async resetToSampleData(): Promise<void> {
    this.saveReviews(INITIAL_REVIEWS);
  }
}
