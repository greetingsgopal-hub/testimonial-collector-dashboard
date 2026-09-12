import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats } from '../../types';

export class SupabaseAdapter implements StorageAdapter {
  name = 'Supabase Cloud (PostgreSQL)';
  isCloud = true;
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = url.replace(/\/$/, '');
    this.anonKey = anonKey;
  }

  private get headers() {
    return {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  }

  // Convert snake_case from DB to camelCase for App
  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      company: row.company || undefined,
      avatarUrl: row.avatar_url || undefined,
      rating: Number(row.rating),
      title: row.title || undefined,
      content: row.content,
      type: row.type || 'text',
      videoUrl: row.video_url || undefined,
      tags: Array.isArray(row.tags) ? row.tags : [],
      source: row.source || 'form',
      status: row.status || 'pending',
      isFeatured: Boolean(row.is_featured),
      consent: Boolean(row.consent),
      helpfulCount: row.helpful_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Convert camelCase from App to snake_case for DB
  private mapReviewToRow(review: Partial<ReviewInput | Review>): any {
    const row: any = {};
    if (review.name !== undefined) row.name = review.name;
    if (review.email !== undefined) row.email = review.email;
    if (review.role !== undefined) row.role = review.role;
    if (review.company !== undefined) row.company = review.company;
    if (review.avatarUrl !== undefined) row.avatar_url = review.avatarUrl;
    if (review.rating !== undefined) row.rating = review.rating;
    if (review.title !== undefined) row.title = review.title;
    if (review.content !== undefined) row.content = review.content;
    if (review.type !== undefined) row.type = review.type;
    if (review.videoUrl !== undefined) row.video_url = review.videoUrl;
    if (review.tags !== undefined) row.tags = review.tags;
    if (review.source !== undefined) row.source = review.source;
    if (review.status !== undefined) row.status = review.status;
    if (review.isFeatured !== undefined) row.is_featured = review.isFeatured;
    if (review.consent !== undefined) row.consent = review.consent;
    return row;
  }

  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${this.url}/rest/v1/reviews?select=*&order=created_at.desc`, {
      headers: this.headers,
    });
    if (!res.ok) {
      throw new Error(`Supabase query failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map(this.mapRowToReview);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const res = await fetch(`${this.url}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}&select=*`, {
      headers: this.headers,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return this.mapRowToReview(data[0]);
  }

  async createReview(input: ReviewInput): Promise<Review> {
    const payload = this.mapReviewToRow({
      ...input,
      status: input.status || 'pending',
      source: input.source || 'form',
      isFeatured: input.isFeatured || false,
    });

    const res = await fetch(`${this.url}/rest/v1/reviews`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase insert failed: ${err}`);
    }

    const data = await res.json();
    return this.mapRowToReview(data[0]);
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const payload = this.mapReviewToRow(updates);

    const res = await fetch(`${this.url}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase update failed: ${err}`);
    }

    const data = await res.json();
    return this.mapRowToReview(data[0]);
  }

  async deleteReview(id: string): Promise<boolean> {
    const res = await fetch(`${this.url}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    return res.ok;
  }

  async getStats(): Promise<ReviewStats> {
    const reviews = await this.getReviews();
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
}
