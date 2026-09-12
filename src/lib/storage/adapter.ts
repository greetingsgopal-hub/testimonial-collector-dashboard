import { Review, ReviewInput, ReviewStats, CollectionForm, Project } from '../../types';

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
  
  // Phase 2: Collection Form Management
  getCollectionForm(projectId?: string): Promise<CollectionForm | null>;
  getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null>;
  updateCollectionForm(id: string, updates: Partial<CollectionForm>): Promise<CollectionForm>;
  createCollectionForm(form: Omit<CollectionForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionForm>;
}
