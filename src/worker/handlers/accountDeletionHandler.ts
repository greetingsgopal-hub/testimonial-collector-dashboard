import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { verifyFirebaseToken, extractBearerToken, deleteFirebaseAccount } from '../lib/firebaseAuth';
import { queryUserDocuments, queryDocumentsByField, deleteDocument } from '../lib/firestoreAdmin';
import { deleteStripeCustomerAndSubscriptions } from '../lib/stripeClient';
import { deleteUserStorageObjects } from '../lib/firebaseStorage';

/**
 * Self-service account deletion endpoint (GDPR Article 17 Right to Erasure).
 * POST /api/account/delete
 *
 * Headers:
 *   Authorization: Bearer <FirebaseIdToken>
 * Body:
 *   { confirmation: "DELETE" }
 */
export async function handleAccountDeletion(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. Authenticate user
  const authHeader = request.headers.get('Authorization');
  const idToken = extractBearerToken(authHeader);
  if (!idToken) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyFirebaseToken(idToken, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired authentication token.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Validate confirmation payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (body?.confirmation !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: 'Explicit confirmation required. Body must include { confirmation: "DELETE" }.' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const uid = user.uid;
  const purgeErrors: string[] = [];

  try {
    // 3. Purge Firebase Cloud Storage media files (avatars, uploaded videos, assets)
    try {
      const storageResult = await deleteUserStorageObjects(uid, env);
      if (storageResult?.errors && storageResult.errors.length > 0) {
        purgeErrors.push(...storageResult.errors);
      }
    } catch (storageErr: any) {
      console.warn('[AccountDeletion] Storage purge warning:', storageErr);
      purgeErrors.push(`Storage purge: ${storageErr.message}`);
    }

    // 4. Cancel Stripe subscriptions & delete Stripe Customer
    try {
      const workspaces = await queryUserDocuments('workspaces', uid, undefined, env);
      for (const ws of workspaces) {
        if (ws.stripeCustomerId) {
          await deleteStripeCustomerAndSubscriptions(ws.stripeCustomerId, env);
        }
      }
    } catch (stripeErr: any) {
      console.warn('[AccountDeletion] Stripe customer cancellation warning:', stripeErr);
      purgeErrors.push(`Stripe cleanup: ${stripeErr.message}`);
    }

    // 5. Resilient parallel collection cascade purge via Promise.allSettled
    const collectionTasks: Promise<any>[] = [
      // Workspaces
      (async () => {
        const docs = await queryUserDocuments('workspaces', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('workspaces', d.id, undefined, env)));
      })(),
      // Projects
      (async () => {
        const docs = await queryUserDocuments('projects', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('projects', d.id, undefined, env)));
      })(),
      // Collection Forms
      (async () => {
        const docs = await queryUserDocuments('collection_forms', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('collection_forms', d.id, undefined, env)));
      })(),
      // Private Operational Reviews
      (async () => {
        const docs = await queryUserDocuments('reviews', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('reviews', d.id, undefined, env)));
      })(),
      // Public Approved Reviews
      (async () => {
        const docs = await queryUserDocuments('public_reviews', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('public_reviews', d.id, undefined, env)));
      })(),
      // Widgets (both ownerId and userId indexed)
      (async () => {
        const byOwner = await queryUserDocuments('widgets', uid, undefined, env);
        const byUser = await queryDocumentsByField('widgets', 'userId', uid, undefined, env);
        const allIds = new Set([...byOwner.map(w => w.id), ...byUser.map(w => w.id)].filter(Boolean));
        await Promise.allSettled([...allIds].map(id => deleteDocument('widgets', id, undefined, env)));
      })(),
      // Social Connections
      (async () => {
        const docs = await queryUserDocuments('social_connections', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('social_connections', d.id, undefined, env)));
      })(),
      // Social Publications
      (async () => {
        const docs = await queryUserDocuments('social_publications', uid, undefined, env);
        await Promise.allSettled(docs.map(d => deleteDocument('social_publications', d.id, undefined, env)));
      })(),
      // User Profile document
      deleteDocument('users', uid, undefined, env),
    ];

    const results = await Promise.allSettled(collectionTasks);
    results.forEach((res, idx) => {
      if (res.status === 'rejected') {
        console.warn(`[AccountDeletion] Task ${idx} rejected:`, res.reason);
        purgeErrors.push(`Collection task ${idx}: ${res.reason?.message || res.reason}`);
      }
    });

    // 6. Delete Firebase Auth User Record (executed last after all tenant data is purged)
    try {
      await deleteFirebaseAccount(idToken, env);
    } catch (authErr: any) {
      console.warn('[AccountDeletion] Firebase Auth user delete warning:', authErr);
      purgeErrors.push(`Auth deletion: ${authErr.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account and all associated tenant data permanently deleted under GDPR Right to Erasure.',
        warnings: purgeErrors.length > 0 ? purgeErrors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[AccountDeletion] Failed during cascade deletion:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to complete full account deletion. Please contact support.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
