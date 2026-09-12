import { Review, ReviewInput, ReviewStats } from '../../types';

export interface StorageAdapter {
  name: string;
  isCloud: boolean;
  getReviews(projectId?: string): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  createReview(review: ReviewInput, projectId?: string): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;
  getStats(projectId?: string): Promise<ReviewStats>;
  resetToSampleData?(projectId?: string): Promise<void>;
}
