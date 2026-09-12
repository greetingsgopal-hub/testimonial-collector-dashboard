import { StorageAdapter } from './adapter';
import { Review, ReviewInput, ReviewStats, CollectionForm, Project } from '../../types';
import { INITIAL_REVIEWS } from '../seedData';

const STORAGE_KEY_PREFIX = 'reviewvault_testimonials_project_';

export class LocalStorageAdapter implements StorageAdapter {
  name = 'Local Storage (Development/Demo Mode)';
  isCloud = false;

  private getStorageKey(projectId?: string): string {
    return `${STORAGE_KEY_PREFIX}${projectId || 'default'}`;
  }

  private loadReviews(projectId?: string): Review[] {
    try {
      const key = this.getStorageKey(projectId);
      const data = localStorage.getItem(key);
      if (!data) {
        // If this is a demo project or default, populate with demo reviews initially
        if (!projectId || projectId === 'proj-demo-1' || projectId === 'default') {
          const seeded = INITIAL_REVIEWS.map(r => ({ ...r, projectId: projectId || 'proj-demo-1' }));
          localStorage.setItem(key, JSON.stringify(seeded));
          return seeded;
        }
        return [];
      }
      return JSON.parse(data) as Review[];
    } catch (e) {
      console.error('Failed to parse reviews from localStorage', e);
      return [];
    }
  }

  private saveReviews(reviews: Review[], projectId?: string): void {
    try {
      const key = this.getStorageKey(projectId);
      localStorage.setItem(key, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }

  async getReviews(projectId?: string): Promise<Review[]> {
    return this.loadReviews(projectId);
  }

  async getReviewById(id: string): Promise<Review | null> {
    // Search across active keys or default
    const reviews = this.loadReviews();
    return reviews.find(r => r.id === id) || null;
  }

  async createReview(input: ReviewInput, projectId?: string): Promise<Review> {
    const targetProject = projectId || input.projectId || 'proj-demo-1';
    const reviews = this.loadReviews(targetProject);
    
    const newReview: Review = {
      ...input,
      id: 'rev-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      projectId: targetProject,
      source: input.source || 'form',
      status: input.status || 'pending',
      isFeatured: false,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews, targetProject);
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const reviews = this.loadReviews(updates.projectId);
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Review with id ${id} not found in project`);
    }

    const updated: Review = {
      ...reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updated;
    this.saveReviews(reviews, updates.projectId || updated.projectId);
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

  async getStats(projectId?: string): Promise<ReviewStats> {
    const reviews = this.loadReviews(projectId);
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

  async resetToSampleData(projectId?: string): Promise<void> {
    const targetProject = projectId || 'proj-demo-1';
    const seeded = INITIAL_REVIEWS.map(r => ({ ...r, projectId: targetProject }));
    this.saveReviews(seeded, targetProject);
  }

  // Phase 2: Collection Form Management
  private getFormStorageKey(projectId?: string): string {
    return `reviewvault_collection_form_${projectId || 'default'}`;
  }

  async getCollectionForm(projectId?: string): Promise<CollectionForm | null> {
    const target = projectId || 'proj-demo-1';
    const key = this.getFormStorageKey(target);
    const data = localStorage.getItem(key);
    if (!data) {
      const defaultForm: CollectionForm = {
        id: 'form-' + target,
        projectId: target,
        publicSlug: target === 'proj-demo-1' ? 'pulse-feedback' : `${target}-feedback`,
        title: 'Share Your Experience',
        description: 'Your honest feedback helps our team and community grow.',
        isActive: true,
        allowVideo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(defaultForm));
      return defaultForm;
    }
    try {
      return JSON.parse(data) as CollectionForm;
    } catch {
      return null;
    }
  }

  async updateCollectionForm(id: string, updates: Partial<CollectionForm>): Promise<CollectionForm> {
    const target = updates.projectId || 'proj-demo-1';
    const key = this.getFormStorageKey(target);
    const existing = await this.getCollectionForm(target);
    const updated: CollectionForm = {
      ...(existing || {
        id,
        projectId: target,
        publicSlug: 'feedback',
        title: 'Share Your Experience',
        description: '',
        isActive: true,
        allowVideo: true,
        createdAt: new Date().toISOString(),
      }),
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }

  async getCollectionFormBySlug(publicSlug: string): Promise<{ form: CollectionForm; project: Project } | null> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reviewvault_form_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const form = JSON.parse(val) as CollectionForm;
            if (form.publicSlug === publicSlug) {
              return {
                form,
                project: {
                  id: form.projectId,
                  workspaceId: 'ws-demo-1',
                  name: 'Demo Product',
                  slug: 'demo-product',
                  createdAt: form.createdAt,
                }
              };
            }
          }
        } catch {
          // ignore
        }
      }
    }
    const demoForm = await this.getCollectionForm('proj-demo-1');
    if (demoForm && (demoForm.publicSlug === publicSlug || publicSlug === 'pulse-feedback')) {
      return {
        form: demoForm,
        project: {
          id: 'proj-demo-1',
          workspaceId: 'ws-demo-1',
          name: 'Pulse AI Product',
          slug: 'pulse-ai',
          createdAt: demoForm.createdAt,
        }
      };
    }
    return null;
  }

  async createCollectionForm(form: Omit<CollectionForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionForm> {
    const newId = 'form-' + Math.random().toString(36).substring(2, 9);
    const created: CollectionForm = {
      ...form,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const key = this.getFormStorageKey(form.projectId);
    localStorage.setItem(key, JSON.stringify(created));
    return created;
  }
}
