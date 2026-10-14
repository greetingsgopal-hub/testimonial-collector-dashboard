import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { verifyFirebaseToken, extractBearerToken, deleteFirebaseAccount } from '../lib/firebaseAuth';
import { queryUserDocuments, queryDocumentsByField, deleteDocument } from '../lib/firestoreAdmin';
import { deleteStripeCustomerAndSubscriptions } from '../lib/stripeClient';

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

  try {
    // 3. Cascade Purge: Workspaces & Stripe Customer
    const workspaces = await queryUserDocuments('workspaces', uid, undefined, env);
    for (const ws of workspaces) {
      if (ws.stripeCustomerId) {
        await deleteStripeCustomerAndSubscriptions(ws.stripeCustomerId, env);
      }
      if (ws.id) {
        await deleteDocument('workspaces', ws.id, undefined, env);
      }
    }

    // 4. Cascade Purge: Projects
    const projects = await queryUserDocuments('projects', uid, undefined, env);
    for (const p of projects) {
      if (p.id) {
        await deleteDocument('projects', p.id, undefined, env);
      }
    }

    // 5. Cascade Purge: Collection Forms
    const forms = await queryUserDocuments('collection_forms', uid, undefined, env);
    for (const f of forms) {
      if (f.id) {
        await deleteDocument('collection_forms', f.id, undefined, env);
      }
    }

    // 6. Cascade Purge: Private Reviews
    const reviews = await queryUserDocuments('reviews', uid, undefined, env);
    for (const r of reviews) {
      if (r.id) {
        await deleteDocument('reviews', r.id, undefined, env);
      }
    }

    // 7. Cascade Purge: Public Approved Reviews
    const publicReviews = await queryUserDocuments('public_reviews', uid, undefined, env);
    for (const pr of publicReviews) {
      if (pr.id) {
        await deleteDocument('public_reviews', pr.id, undefined, env);
      }
    }

    // 8. Cascade Purge: Widgets (check both ownerId and userId fields)
    const widgetsByOwner = await queryUserDocuments('widgets', uid, undefined, env);
    const widgetsByUser = await queryDocumentsByField('widgets', 'userId', uid, undefined, env);
    const widgetIds = new Set([...widgetsByOwner.map(w => w.id), ...widgetsByUser.map(w => w.id)].filter(Boolean));
    for (const wId of widgetIds) {
      await deleteDocument('widgets', wId, undefined, env);
    }

    // 9. Cascade Purge: Social Connections & Publications
    const socialConns = await queryUserDocuments('social_connections', uid, undefined, env);
    for (const sc of socialConns) {
      if (sc.id) {
        await deleteDocument('social_connections', sc.id, undefined, env);
      }
    }

    const socialPubs = await queryUserDocuments('social_publications', uid, undefined, env);
    for (const sp of socialPubs) {
      if (sp.id) {
        await deleteDocument('social_publications', sp.id, undefined, env);
      }
    }

    // 10. Purge User Profile Document
    await deleteDocument('users', uid, undefined, env);

    // 11. Delete Firebase Auth User Record
    await deleteFirebaseAccount(idToken, env);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account and all associated tenant data permanently deleted under GDPR Right to Erasure.',
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
