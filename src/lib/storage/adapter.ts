import { Review, ReviewInput, ReviewStats } from '../../types';

export interface StorageAdapter {
  name: string;
  isCloud: boolean;
  getReviews(): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  createReview(review: ReviewInput): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;
  getStats(): Promise<ReviewStats>;
  resetToSampleData?(): Promise<void>;
}
