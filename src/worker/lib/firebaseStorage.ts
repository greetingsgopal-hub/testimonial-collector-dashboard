import { WorkerEnv } from '../types';
import { getServiceAccountAccessToken } from './googleAuth';

/**
 * Purges all user-owned files from Firebase Cloud Storage under GDPR Article 17 Right to Erasure.
 * Uses the Google Cloud Storage JSON API with the privileged service account access token.
 */
export async function deleteUserStorageObjects(uid: string, env: WorkerEnv): Promise<{ deletedCount: number; errors: string[] }> {
  if (!uid) return { deletedCount: 0, errors: ['Missing user ID'] };

  const saToken = await getServiceAccountAccessToken(env);
  if (!saToken) {
    console.warn('[FirebaseStorage] No service account token available to purge storage.');
    return { deletedCount: 0, errors: ['No service account credentials available'] };
  }

  const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
  // Standard Firebase Storage bucket conventions
  const buckets = [
    `${projectId}.appspot.com`,
    `${projectId}.firebasestorage.app`,
  ];

  const prefixes = [
    `${uid}/`,
    `users/${uid}/`,
    `avatars/${uid}/`,
    `videos/${uid}/`,
    `testimonials/${uid}/`,
  ];

  let totalDeleted = 0;
  const errors: string[] = [];

  for (const bucket of buckets) {
    for (const prefix of prefixes) {
      try {
        const listUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o?prefix=${encodeURIComponent(prefix)}`;
        const listRes = await fetch(listUrl, {
          headers: { Authorization: `Bearer ${saToken}` },
        });

        if (listRes.status === 404) {
          // Bucket does not exist or has alternative name; continue checking
          continue;
        }

        if (!listRes.ok) {
          continue;
        }

        const data: any = await listRes.json();
        const items = data.items || [];

        for (const item of items) {
          if (item.name) {
            try {
              const delUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(item.name)}`;
              const delRes = await fetch(delUrl, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${saToken}` },
              });
              if (delRes.ok || delRes.status === 404) {
                totalDeleted++;
              } else {
                errors.push(`Failed to delete ${item.name}: ${delRes.status}`);
              }
            } catch (delErr: any) {
              errors.push(`Error deleting ${item.name}: ${delErr.message}`);
            }
          }
        }
      } catch (err: any) {
        errors.push(`Storage list failed for ${bucket}/${prefix}: ${err.message}`);
      }
    }
  }

  return { deletedCount: totalDeleted, errors };
}
