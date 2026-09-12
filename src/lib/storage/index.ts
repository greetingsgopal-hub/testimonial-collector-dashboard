import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { isSupabaseConfigured } from '../supabaseClient';

export * from './adapter';
export { SupabaseAdapter, LocalStorageAdapter };

function initializeStorage(): StorageAdapter {
  if (isSupabaseConfigured) {
    console.log('[Storage] Initialized Multi-Tenant Supabase Adapter');
    return new SupabaseAdapter();
  }

  console.warn(
    '[Storage] Supabase is NOT configured. Running in Local Development / Demo Mode. Real production data will not be persisted to cloud until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
  return new LocalStorageAdapter();
}

export const storage = initializeStorage();

export function getActiveBackendInfo() {
  if (isSupabaseConfigured) {
    return {
      type: 'supabase' as const,
      name: 'Supabase Cloud (Multi-Tenant PostgreSQL)',
      status: 'Connected & Enforcing RLS',
      isProductionReady: true,
      url: import.meta.env.VITE_SUPABASE_URL,
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
