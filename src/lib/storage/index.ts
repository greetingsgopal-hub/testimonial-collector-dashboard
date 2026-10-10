import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { isFirebaseConfigured } from '../firebase';

export * from './adapter';
export { FirebaseAdapter, LocalStorageAdapter };

const firebaseAdapter = isFirebaseConfigured ? new FirebaseAdapter() : null;
const localStorageAdapter = new LocalStorageAdapter();

class DelegatingStorageAdapter implements StorageAdapter {
  name = 'Panda Praise Storage Router';
  isCloud = isFirebaseConfigured;

  private get adapter(): StorageAdapter {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('pandapraise_demo_mode') === 'true';
    if (isDemo || !firebaseAdapter) {
      return localStorageAdapter;
    }
    return firebaseAdapter;
  }

  getReviews(projectId?: string) { return this.adapter.getReviews(projectId); }
  getReviewById(id: string) { return this.adapter.getReviewById(id); }
  createReview(review: any, projectId?: string) { return this.adapter.createReview(review, projectId); }
  async bulkCreateReviews(reviews: any[], projectId: string) {
    if (this.adapter.bulkCreateReviews) {
      return this.adapter.bulkCreateReviews(reviews, projectId);
    }
    const created: any[] = [];
    for (const r of reviews) {
      created.push(await this.adapter.createReview(r, projectId));
    }
    return created;
  }
  updateReview(id: string, updates: any) { return this.adapter.updateReview(id, updates); }
  deleteReview(id: string) { return this.adapter.deleteReview(id); }
  getStats(projectId?: string) { return this.adapter.getStats(projectId); }
  getCollectionForm(projectId?: string) { return this.adapter.getCollectionForm(projectId); }
  updateCollectionForm(id: string, updates: any) { return this.adapter.updateCollectionForm(id, updates); }
  createCollectionForm(form: any) { return this.adapter.createCollectionForm(form); }
  getCollectionFormBySlug(publicSlug: string) { return this.adapter.getCollectionFormBySlug(publicSlug); }
  async evaluateAutoApproval(reviewId: string, projectId?: string): Promise<import('../../types').Review | null> {
    if (!this.adapter.evaluateAutoApproval) return null;
    return this.adapter.evaluateAutoApproval(reviewId, projectId);
  }
  async resetToSampleData(projectId?: string): Promise<void> {
    if (!this.adapter.resetToSampleData) return;
    return this.adapter.resetToSampleData(projectId);
  }

  // ── Automated Campaigns ─────────────────────────────────
  getCampaigns(projectId?: string) {
    if (this.adapter.getCampaigns) return this.adapter.getCampaigns(projectId);
    return Promise.resolve([]);
  }
  getCampaignById(id: string) {
    if (this.adapter.getCampaignById) return this.adapter.getCampaignById(id);
    return Promise.resolve(null);
  }
  createCampaign(campaign: any, projectId?: string) {
    if (this.adapter.createCampaign) return this.adapter.createCampaign(campaign, projectId);
    throw new Error('createCampaign not supported');
  }
  updateCampaign(id: string, updates: any) {
    if (this.adapter.updateCampaign) return this.adapter.updateCampaign(id, updates);
    throw new Error('updateCampaign not supported');
  }
  deleteCampaign(id: string) {
    if (this.adapter.deleteCampaign) return this.adapter.deleteCampaign(id);
    return Promise.resolve(false);
  }
  getCampaignLogs(campaignId?: string, projectId?: string) {
    if (this.adapter.getCampaignLogs) return this.adapter.getCampaignLogs(campaignId, projectId);
    return Promise.resolve([]);
  }
  createCampaignLog(log: any) {
    if (this.adapter.createCampaignLog) return this.adapter.createCampaignLog(log);
    throw new Error('createCampaignLog not supported');
  }
  updateCampaignLog(id: string, updates: any) {
    if (this.adapter.updateCampaignLog) return this.adapter.updateCampaignLog(id, updates);
    throw new Error('updateCampaignLog not supported');
  }
}

export const storage: StorageAdapter = new DelegatingStorageAdapter();

export function getActiveBackendInfo() {
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pandapraise_demo_mode') === 'true';
  if (isDemo) {
    return {
      type: 'local' as const,
      name: 'Interactive Demo Workspace (Isolated LocalStorage)',
      status: 'Demo Mode (Zero Production Access)',
      isProductionReady: false,
      url: 'In-Browser LocalStorage Sandbox',
    };
  }

  if (isFirebaseConfigured) {
    return {
      type: 'firebase' as const,
      name: 'Firebase Cloud Firestore (Multi-Tenant)',
      status: 'Connected & Enforcing Security Rules',
      isProductionReady: true,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    };
  }

  return {
    type: 'local' as const,
    name: 'Browser LocalStorage (Demo Mode)',
    status: 'Demo Only (Cloud Database Unconfigured)',
    isProductionReady: false,
    url: 'In-Browser LocalStorage',
  };
}
