// src/worker/lib/firestore.ts
// Canonical Firestore persistence and ownership helpers for Panda Praise reviews.
// Pure HTTP REST implementation compatible with Cloudflare Workers isolates.

import { createHash } from 'crypto';
import { getDocument, saveDocument, queryUserDocuments } from './firestoreAdmin';
import { verifyFirebaseToken } from './firebaseAuth';

/**
 * Validates that an external review identifier conforms to safe Firestore / application standards.
 * Rejects empty, non-string, or oversized identifiers.
 */
export function validateExternalId(externalId: any): string {
  if (typeof externalId !== 'string' || !externalId.trim()) {
    throw new Error('External ID is required and must be a non-empty string');
  }
  const trimmed = externalId.trim();
  if (trimmed.length > 1024) {
    throw new Error('External ID exceeds maximum allowed length of 1024 characters');
  }
  if (trimmed.includes('\0')) {
    throw new Error('External ID contains invalid null byte');
  }
  return trimmed;
}

/**
 * Deterministically generates a tenant-isolated Firestore document ID.
 * Uses SHA-256 hash to eliminate path traversal issues (such as slashes in Google resource paths)
 * and prevent cross-tenant collisions.
 */
export function generateReviewDocId(ownerId: string, provider: string, externalId: string): string {
  const safeExternal = validateExternalId(externalId);
  const hash = createHash('sha256').update(`${provider}:${safeExternal}`).digest('hex').substring(0, 32);
  return `imp_${ownerId}_${hash}`;
}

/**
 * Verifies the Panda Praise Firebase ID token and extracts the authenticated UID.
 * Rejects unauthenticated callers or invalid tokens.
 */
export async function verifyFirebaseIdentity(firebaseIdToken?: string, env?: any): Promise<string> {
  if (!firebaseIdToken || typeof firebaseIdToken !== 'string' || !firebaseIdToken.trim()) {
    throw new Error('Missing or empty Firebase ID token');
  }
  const fallbackEnv = env || {
    FIREBASE_API_KEY: (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || 'AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE',
    FIREBASE_PROJECT_ID: (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || 'testimonialcollectordashboard',
  };
  const verified = await verifyFirebaseToken(firebaseIdToken.trim(), fallbackEnv);
  if (!verified || !verified.uid) {
    throw new Error('Invalid Firebase authentication token');
  }
  return verified.uid;
}

/**
 * Resolves the verified user's existing workspace and project.
 * Never blindly trusts client-supplied ownerId or workspaceId.
 */
export async function resolveUserOwnership(
  ownerId: string,
  requestedProjectId?: string,
  env?: any
): Promise<{ ownerId: string; workspaceId: string; projectId: string }> {
  const fallbackEnv = env || {
    FIREBASE_API_KEY: (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || 'AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE',
    FIREBASE_PROJECT_ID: (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || 'testimonialcollectordashboard',
  };

  let workspaceId = `ws_${ownerId}`;
  try {
    const workspaces = await queryUserDocuments('workspaces', ownerId, null, fallbackEnv);
    if (workspaces && workspaces.length > 0) {
      workspaceId = workspaces[0].id;
    }
  } catch (_err) {}

  let projectId = `proj_${ownerId}`;
  if (requestedProjectId && typeof requestedProjectId === 'string') {
    try {
      const projDoc = await getDocument('projects', requestedProjectId, null, fallbackEnv);
      if (projDoc && projDoc.ownerId === ownerId) {
        projectId = requestedProjectId;
      }
    } catch (_err) {}
  }

  if (projectId === `proj_${ownerId}`) {
    try {
      const projects = await queryUserDocuments('projects', ownerId, null, fallbackEnv);
      if (projects && projects.length > 0) {
        projectId = projects[0].id;
      }
    } catch (_err) {}
  }

  return { ownerId, workspaceId, projectId };
}

/**
 * Checks whether a review with the given provider and externalId already exists for this owner.
 * Scoped by ownerId + provider + externalId.
 */
export async function isDuplicate(ownerId: string, provider: string, externalId: string, env?: any): Promise<boolean> {
  const docId = generateReviewDocId(ownerId, provider, externalId);
  const fallbackEnv = env || {
    FIREBASE_API_KEY: (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || 'AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE',
    FIREBASE_PROJECT_ID: (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || 'testimonialcollectordashboard',
  };
  try {
    const doc = await getDocument('reviews', docId, null, fallbackEnv);
    return Boolean(doc);
  } catch (_e) {
    return false;
  }
}

/**
 * Batch persists an array of reviews into the canonical /reviews collection.
 * Every review is stamped with verified ownerId, workspaceId, projectId, provider, externalId, resourceId, and timestamps.
 */
export async function saveReviewsBatch(
  ownerId: string,
  workspaceId: string,
  projectId: string,
  provider: string,
  resourceId: string | undefined,
  reviews: any[],
  env?: any
): Promise<any[]> {
  const fallbackEnv = env || {
    FIREBASE_API_KEY: (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || 'AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE',
    FIREBASE_PROJECT_ID: (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || 'testimonialcollectordashboard',
  };
  const now = new Date().toISOString();
  const savedDocs: any[] = [];

  for (const review of reviews) {
    const safeExternalId = validateExternalId(review.externalId);
    const docId = generateReviewDocId(ownerId, provider, safeExternalId);

    const canonicalReview = {
      id: docId,
      ownerId,
      workspaceId,
      projectId,
      collectionFormId: null,
      name: review.author || review.name || 'Anonymous',
      email: review.email || '',
      role: review.role || 'Customer',
      company: review.company || null,
      avatarUrl: review.avatarUrl || null,
      rating: typeof review.rating === 'number' ? review.rating : 5,
      title: review.title || null,
      content: review.text || review.content || '',
      type: review.type || 'text',
      tags: Array.isArray(review.tags) && review.tags.length > 0 ? review.tags : ['imported', provider],
      source: provider,
      provider,
      externalId: safeExternalId,
      sourcePlatformId: safeExternalId,
      resourceId: resourceId || review.resourceId || null,
      sourceUrl: review.sourceUrl || null,
      status: review.status || 'approved',
      isFeatured: Boolean(review.isFeatured),
      consent: true,
      helpfulCount: 0,
      createdAt: review.createdAt || now,
      updatedAt: now,
      importedAt: now,
    };

    await saveDocument('reviews', docId, canonicalReview, null, fallbackEnv);
    savedDocs.push(canonicalReview);
  }

  return savedDocs;
}
