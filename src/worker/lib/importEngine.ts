import { getProvider, ProviderCapability, ProviderEntry } from './providersRegistry';
import { ImportRequest } from './adapter';
import {
  isDuplicate,
  saveReviewsBatch,
  verifyFirebaseIdentity,
  resolveUserOwnership,
  validateExternalId
} from './firestore';

/**
 * Validate the structure of an ImportRequest.
 * Returns an error message string if invalid, otherwise null.
 */
function validateImportRequest(request: ImportRequest): string | null {
  if (!request || typeof request !== 'object') {
    return 'ImportRequest must be an object';
  }
  if (!request.providerId || typeof request.providerId !== 'string') {
    return 'providerId is required and must be a string';
  }
  if (!request.params || typeof request.params !== 'object') {
    return 'params must be an object';
  }
  if (!request.firebaseIdToken || typeof request.firebaseIdToken !== 'string' || !request.firebaseIdToken.trim()) {
    return 'firebaseIdToken is required for authenticated import';
  }
  return null;
}

/**
 * High-level import status values.
 */
export enum ImportStatus {
  SUCCESS = 'SUCCESS',
  EMPTY_SUCCESS = 'EMPTY_SUCCESS',
  FAILED = 'FAILED',
  UNSUPPORTED = 'UNSUPPORTED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  RESOURCE_SELECTION_REQUIRED = 'RESOURCE_SELECTION_REQUIRED',
}

/**
 * Result returned by the ImportEngine.
 */
export interface EngineResult {
  status: ImportStatus;
  /** Number of imported testimonials (zero is valid) */
  importedCount?: number;
  /** Normalized testimonial objects */
  reviews?: any[];
  /** Human-readable error message when status is FAILED or AUTH_REQUIRED */
  error?: string;
  /** Available resources when selection is required */
  resources?: any[];
}

/**
 * Core import pipeline adhering to Panda Praise canonical architecture:
 * VERIFIED FIREBASE CALLER -> RESOLVE WORKSPACE/PROJECT -> DISCOVER/SELECT RESOURCE -> FETCH -> NORMALIZE -> TENANT DEDUP -> CANONICAL /reviews PERSISTENCE
 */
export async function importProvider(request: ImportRequest): Promise<EngineResult> {
  // 1. Validate request structure
  const validationError = validateImportRequest(request);
  if (validationError) {
    if (validationError.includes('firebaseIdToken')) {
      return { status: ImportStatus.AUTH_REQUIRED, error: validationError };
    }
    return { status: ImportStatus.FAILED, error: validationError };
  }

  // 2. Authenticate Panda Praise caller and resolve tenant ownership hierarchy
  let ownerId: string;
  let workspaceId: string;
  let projectId: string;
  try {
    ownerId = await verifyFirebaseIdentity(request.firebaseIdToken);
    const ownership = await resolveUserOwnership(ownerId, request.params?.projectId);
    workspaceId = ownership.workspaceId;
    projectId = ownership.projectId;
  } catch (authErr) {
    return { status: ImportStatus.AUTH_REQUIRED, error: (authErr as Error).message };
  }

  // 3. Provider validation and capability verification
  let entry: ProviderEntry;
  try {
    entry = getProvider(request.providerId);
  } catch (e) {
    return { status: ImportStatus.UNSUPPORTED, error: (e as Error).message };
  }

  // We require API capability for importing reviews
  if (!entry.capabilities[ProviderCapability.API]) {
    return { status: ImportStatus.UNSUPPORTED, error: 'API capability not supported' };
  }

  const adapter = entry.adapter;
  if (!adapter) {
    return { status: ImportStatus.UNSUPPORTED, error: 'No adapter implementation' };
  }

  // 4. Authenticate with provider OAuth if required
  if (entry.capabilities[ProviderCapability.OAUTH] && adapter.authenticate) {
    try {
      await adapter.authenticate(request);
    } catch (e) {
      return { status: ImportStatus.AUTH_REQUIRED, error: (e as Error).message };
    }
  }

  // 5. Resource discovery / selection
  let selectedResourceId: string | undefined = undefined;
  if (adapter.discoverResources) {
    const resources = await adapter.discoverResources(request);
    const hasExplicit = Object.keys(request.params).some((k) => k.toLowerCase().includes('id') && request.params[k]);
    if (!hasExplicit) {
      if (resources.length === 0) {
        return { status: ImportStatus.FAILED, error: 'No resources discovered' };
      }
      if (resources.length > 1) {
        return { status: ImportStatus.RESOURCE_SELECTION_REQUIRED, resources };
      }
      // Single resource - auto select
      const single = resources[0];
      const idKey = Object.keys(single).find((k) => k.toLowerCase().endsWith('id'));
      if (idKey) {
        request.params[idKey] = (single as any)[idKey];
        selectedResourceId = String((single as any)[idKey]);
      }
    } else {
      // Find the explicit id from params
      const idKey = Object.keys(request.params).find((k) => k.toLowerCase().includes('id') && request.params[k]);
      if (idKey) {
        selectedResourceId = String(request.params[idKey]);
      }
    }
  }

  // 6. Fetch raw data from provider
  let rawData: any;
  try {
    rawData = await adapter.fetch(request);
  } catch (e) {
    const msg = adapter.mapError ? adapter.mapError(e) : (e as Error).message;
    return { status: ImportStatus.FAILED, error: msg };
  }

  // 7. Normalize raw provider data into canonical structure
  const normalized = adapter.normalize(rawData);

  // 8. Tenant-scoped deduplication
  const uniqueReviews: any[] = [];
  for (const r of normalized) {
    try {
      const validId = validateExternalId(r.externalId);
      const isDup = await isDuplicate(ownerId, request.providerId, validId);
      if (!isDup) {
        uniqueReviews.push(r);
      }
    } catch (err) {
      // Skip malformed records with invalid external IDs
      continue;
    }
  }

  // 9. Batch persist into canonical /reviews store
  let savedDocs: any[] = [];
  if (uniqueReviews.length > 0) {
    savedDocs = await saveReviewsBatch(
      ownerId,
      workspaceId,
      projectId,
      request.providerId,
      selectedResourceId,
      uniqueReviews
    );
  }

  // 10. Build result
  if (savedDocs.length === 0) {
    return { status: ImportStatus.EMPTY_SUCCESS, importedCount: 0, reviews: [] };
  }
  return { status: ImportStatus.SUCCESS, importedCount: savedDocs.length, reviews: savedDocs };
}
