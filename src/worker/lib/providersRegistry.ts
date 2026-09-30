// src/worker/lib/providersRegistry.ts

import { ProviderAdapter } from './adapter';

/**
 * Enumerates the capabilities a provider may support.
 */
export enum ProviderCapability {
  OAUTH = 'oauth',
  API = 'api',
  URL_IMPORT = 'urlImport',
  BROWSER = 'browser',
  MANUAL = 'manual',
  AUTO_SYNC = 'autoSync',
}

/**
 * Definition of a provider entry in the registry.
 */
export interface ProviderEntry {
  id: string;
  displayName: string;
  category: string;
  capabilities: Record<ProviderCapability, boolean>;
  adapter?: ProviderAdapter;
}

// Import adapters
import { GoogleAdapter } from './adapters/googleAdapter';
import { FacebookAdapter } from './adapters/facebookAdapter';
import { InstagramAdapter } from './adapters/instagramAdapter';

export const ProviderRegistry: Record<string, ProviderEntry> = {
  google: {
    id: 'google',
    displayName: 'Google',
    category: 'social',
    capabilities: {
      [ProviderCapability.OAUTH]: true,
      [ProviderCapability.API]: true,
      [ProviderCapability.URL_IMPORT]: true,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: false,
      [ProviderCapability.AUTO_SYNC]: true,
    },
    adapter: new GoogleAdapter(),
  },
  facebook: {
    id: 'facebook',
    displayName: 'Facebook',
    category: 'social',
    capabilities: {
      [ProviderCapability.OAUTH]: true,
      [ProviderCapability.API]: true,
      [ProviderCapability.URL_IMPORT]: false,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: false,
      [ProviderCapability.AUTO_SYNC]: true,
    },
    adapter: new FacebookAdapter(),
  },
  instagram: {
    id: 'instagram',
    displayName: 'Instagram',
    category: 'social',
    capabilities: {
      [ProviderCapability.OAUTH]: true,
      [ProviderCapability.API]: false,
      [ProviderCapability.URL_IMPORT]: false,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: false,
      [ProviderCapability.AUTO_SYNC]: false,
    },
    adapter: new InstagramAdapter(),
  },
  linkedin: {
    id: 'linkedin',
    displayName: 'LinkedIn',
    category: 'social',
    capabilities: {
      [ProviderCapability.OAUTH]: true,
      [ProviderCapability.API]: false,
      [ProviderCapability.URL_IMPORT]: false,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: false,
      [ProviderCapability.AUTO_SYNC]: false,
    },
    // No adapter – import not supported yet
  },
  csv: {
    id: 'csv',
    displayName: 'CSV / Excel',
    category: 'manual',
    capabilities: {
      [ProviderCapability.OAUTH]: false,
      [ProviderCapability.API]: false,
      [ProviderCapability.URL_IMPORT]: false,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: true,
      [ProviderCapability.AUTO_SYNC]: false,
    },
  },
  manual: {
    id: 'manual',
    displayName: 'Manual Entry',
    category: 'manual',
    capabilities: {
      [ProviderCapability.OAUTH]: false,
      [ProviderCapability.API]: false,
      [ProviderCapability.URL_IMPORT]: false,
      [ProviderCapability.BROWSER]: false,
      [ProviderCapability.MANUAL]: true,
      [ProviderCapability.AUTO_SYNC]: false,
    },
  },
};

export function getProvider(id: string): ProviderEntry {
  const entry = ProviderRegistry[id];
  if (!entry) {
    throw new Error(`Provider not found in registry: ${id}`);
  }
  return entry;
}

export const liveProviders = Object.values(ProviderRegistry).filter((p) =>
  Object.values(p.capabilities).some(Boolean)
);


