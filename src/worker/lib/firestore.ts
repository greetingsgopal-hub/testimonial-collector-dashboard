// src/worker/lib/firestore.ts
// Canonical Firestore persistence and ownership helpers for Panda Praise reviews.

import { createHash } from 'crypto';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

export const db: Firestore = getFirestore();
export const reviewsCollection = db.collection('reviews');
export const workspacesCollection = db.collection('workspaces');
export const projectsCollection = db.collection('projects');

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
export async function verifyFirebaseIdentity(firebaseIdToken?: string): Promise<string> {
  if (!firebaseIdToken || typeof firebaseIdToken !== 'string' || !firebaseIdToken.trim()) {
    throw new Error('Missing or empty Firebase ID token');
  }
  // Lazily load getAuth to avoid premature ESM module resolution in test runtimes
  const { getAuth } = require('firebase-admin/auth');
  const decoded = await getAuth().verifyIdToken(firebaseIdToken.trim());
  if (!decoded || !decoded.uid) {
    throw new Error('Invalid Firebase authentication token');
  }
  return decoded.uid;
}

/**
 * Resolves the verified user's existing workspace and project.
 * Never blindly trusts client-supplied ownerId or workspaceId.
 */
export async function resolveUserOwnership(
  ownerId: string,
  requestedProjectId?: string
): Promise<{ ownerId: string; workspaceId: string; projectId: string }> {
  // 1. Resolve workspace
  let workspaceId = `ws_${ownerId}`;
  try {
    const wsSnap = await workspacesCollection.where('ownerId', '==', ownerId).limit(1).get();
    if (!wsSnap.empty) {
      workspaceId = wsSnap.docs[0].id;
    }
  } catch (err) {
    // Tolerant fallback for environments with fresh databases
  }

  // 2. Resolve project
  let projectId = `proj_${ownerId}`;
  if (requestedProjectId && typeof requestedProjectId === 'string') {
    try {
      const projDoc = await projectsCollection.doc(requestedProjectId).get();
      if (projDoc.exists && projDoc.data()?.ownerId === ownerId) {
        projectId = requestedProjectId;
      }
    } catch (err) {
      // Fall through to query by ownerId
    }
  }

  if (projectId === `proj_${ownerId}`) {
    try {
      const projSnap = await projectsCollection.where('ownerId', '==', ownerId).limit(1).get();
      if (!projSnap.empty) {
        projectId = projSnap.docs[0].id;
      }
    } catch (err) {
      // Tolerant fallback
    }
  }

  return { ownerId, workspaceId, projectId };
}

/**
 * Checks whether a review with the given provider and externalId already exists for this owner.
 * Scoped by ownerId + provider + externalId.
 */
export async function isDuplicate(ownerId: string, provider: string, externalId: string): Promise<boolean> {
  const docId = generateReviewDocId(ownerId, provider, externalId);
  const doc = await reviewsCollection.doc(docId).get();
  if (doc.exists) {
    return true;
  }
  // Secondary check against indexed fields
  try {
    const q = await reviewsCollection
      .where('ownerId', '==', ownerId)
      .where('provider', '==', provider)
      .where('externalId', '==', externalId)
      .limit(1)
      .get();
    return !q.empty;
  } catch (e) {
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
  reviews: any[]
): Promise<any[]> {
  const batch = db.batch();
  const now = new Date().toISOString();
  const savedDocs: any[] = [];

  for (const review of reviews) {
    const safeExternalId = validateExternalId(review.externalId);
    const docId = generateReviewDocId(ownerId, provider, safeExternalId);
    const docRef = reviewsCollection.doc(docId);

    const canonicalReview = {
      id: docId,
      ownerId,
      workspaceId,
      projectId,
      collectionFormId: null,
      name: review.name || 'Anonymous',
      email: review.email || '',
      role: review.role || 'Customer',
      company: review.company || null,
      avatarUrl: review.avatarUrl || null,
      rating: typeof review.rating === 'number' ? review.rating : 5,
      title: review.title || null,
      content: review.content || '',
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

    batch.set(docRef, canonicalReview);
    savedDocs.push(canonicalReview);
  }

  if (savedDocs.length > 0) {
    await batch.commit();
  }
  return savedDocs;
}
