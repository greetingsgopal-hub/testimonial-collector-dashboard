import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { RestApiAdapter } from './restApiAdapter';

export * from './adapter';

function initializeStorage(): StorageAdapter {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    console.log('[Storage] Initializing Supabase PostgreSQL Adapter');
    return new SupabaseAdapter(supabaseUrl, supabaseAnonKey);
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  if (apiUrl) {
    console.log('[Storage] Initializing Custom REST API Adapter');
    return new RestApiAdapter(apiUrl, apiKey);
  }

  console.log('[Storage] Using In-Browser LocalStorage Adapter (Seed Data Loaded)');
  return new LocalStorageAdapter();
}

export const storage = initializeStorage();

export function getActiveBackendInfo() {
  const isSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const isApi = Boolean(import.meta.env.VITE_API_URL);

  if (isSupabase) {
    return {
      type: 'supabase' as const,
      name: 'Supabase Cloud (PostgreSQL)',
      status: 'Connected',
      url: import.meta.env.VITE_SUPABASE_URL,
    };
  }

  if (isApi) {
    return {
      type: 'api' as const,
      name: 'Custom REST API',
      status: 'Connected',
      url: import.meta.env.VITE_API_URL,
    };
  }

  return {
    type: 'local' as const,
    name: 'Browser LocalStorage (Zero-Config)',
    status: 'Active (Ready to connect Database)',
    url: 'Client-side LocalStorage',
  };
}
