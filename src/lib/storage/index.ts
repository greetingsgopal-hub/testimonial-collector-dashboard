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
  updateReview(id: string, updates: any) { return this.adapter.updateReview(id, updates); }
  deleteReview(id: string) { return this.adapter.deleteReview(id); }
  getStats(projectId?: string) { return this.adapter.getStats(projectId); }
  getCollectionForm(projectId?: string) { return this.adapter.getCollectionForm(projectId); }
  updateCollectionForm(id: string, updates: any) { return this.adapter.updateCollectionForm(id, updates); }
  createCollectionForm(form: any) { return this.adapter.createCollectionForm(form); }
  getCollectionFormBySlug(publicSlug: string) { return this.adapter.getCollectionFormBySlug(publicSlug); }
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
