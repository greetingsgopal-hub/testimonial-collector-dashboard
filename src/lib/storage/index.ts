import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { isFirebaseConfigured } from '../firebase';

export * from './adapter';
export { FirebaseAdapter, LocalStorageAdapter };

function initializeStorage(): StorageAdapter {
  if (isFirebaseConfigured) {
    console.log('[Storage] Initialized Multi-Tenant Firebase Adapter');
    return new FirebaseAdapter();
  }

  console.warn(
    '[Storage] Firebase is NOT configured. Running in Local Development / Demo Mode. Real production data will not be persisted to cloud until VITE_FIREBASE_* environment variables are set.'
  );
  return new LocalStorageAdapter();
}

export const storage = initializeStorage();

export function getActiveBackendInfo() {
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
