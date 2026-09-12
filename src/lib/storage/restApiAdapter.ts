import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats } from '../../types';

export class RestApiAdapter implements StorageAdapter {
  name = 'Custom REST API';
  isCloud = true;
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private get headers() {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      h['Authorization'] = `Bearer ${this.apiKey}`;
      h['x-api-key'] = this.apiKey;
    }
    return h;
  }

  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${this.baseUrl}/reviews`, { headers: this.headers });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }

  async getReviewById(id: string): Promise<Review | null> {
    const res = await fetch(`${this.baseUrl}/reviews/${encodeURIComponent(id)}`, { headers: this.headers });
    if (!res.ok) return null;
    return res.json();
  }

  async createReview(input: ReviewInput): Promise<Review> {
    const res = await fetch(`${this.baseUrl}/reviews`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const res = await fetch(`${this.baseUrl}/reviews/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }

  async deleteReview(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    return res.ok;
  }

  async getStats(): Promise<ReviewStats> {
    const res = await fetch(`${this.baseUrl}/reviews/stats`, { headers: this.headers });
    if (res.ok) {
      return res.json();
    }
    // Fallback: calculate client-side
    const reviews = await this.getReviews();
    const approved = reviews.filter(r => r.status === 'approved');
    const sumRating = approved.reduce((acc, curr) => acc + curr.rating, 0);
    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
    });

    return {
      total: reviews.length,
      averageRating: approved.length > 0 ? Number((sumRating / approved.length).toFixed(1)) : 0,
      approvedCount: approved.length,
      pendingCount: reviews.filter(r => r.status === 'pending').length,
      rejectedCount: reviews.filter(r => r.status === 'rejected').length,
      archivedCount: reviews.filter(r => r.status === 'archived').length,
      featuredCount: reviews.filter(r => r.isFeatured).length,
      ratingBreakdown,
    };
  }
}
