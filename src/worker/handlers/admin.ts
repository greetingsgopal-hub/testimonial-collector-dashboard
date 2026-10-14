import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { verifyFirebaseToken, extractBearerToken } from '../lib/firebaseAuth';
import { getAuthHeader, fromFirestoreFields, saveDocument } from '../lib/firestoreAdmin';

const DEFAULT_ADMIN_EMAILS = [
  'hello@pandapraise.com',
  'admin@pandapraise.com',
  'founder@pandapraise.com',
  'greetingsgopal@gmail.com',
];

/**
 * Checks whether an email has superadmin privileges.
 */
export function isAuthorizedAdmin(email: string | undefined | null, env: WorkerEnv): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();

  const customAdmins = (env.ADMIN_EMAILS || env.VITE_SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allAdmins = new Set([...DEFAULT_ADMIN_EMAILS, ...customAdmins]);
  return allAdmins.has(normalized);
}

/**
 * GET /api/admin/workspaces
 * Lists all workspaces across the platform.
 */
export async function handleAdminGetWorkspaces(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'GET') {
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

  // 2. Authorize admin
  if (!isAuthorizedAdmin(user.email, env)) {
    return new Response(JSON.stringify({ error: 'Access denied. Superadmin authorization required.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Query all workspaces via Firestore REST using Service Account
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const headers = await getAuthHeader(null, env);

    const body = {
      structuredQuery: {
        from: [{ collectionId: 'workspaces' }],
      },
    };

    const res = await fetch(queryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Admin] Query workspaces failed:', res.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to fetch workspaces from database.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawList: any = await res.json();
    const workspaces: any[] = [];
    if (Array.isArray(rawList)) {
      for (const item of rawList) {
        if (item.document) {
          const parts = item.document.name.split('/');
          const id = parts[parts.length - 1];
          workspaces.push({
            id,
            ...fromFirestoreFields(item.document.fields || {}),
          });
        }
      }
    }

    // Sort descending by createdAt
    workspaces.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return new Response(JSON.stringify({ workspaces }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Admin] Error fetching workspaces:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/workspaces/:id/plan
 * Overrides a workspace's plan tier and billing cycle.
 */
export async function handleAdminUpdateWorkspacePlan(
  request: Request,
  env: WorkerEnv,
  workspaceId: string
): Promise<Response> {
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

  // 2. Authorize admin
  if (!isAuthorizedAdmin(user.email, env)) {
    return new Response(JSON.stringify({ error: 'Access denied. Superadmin authorization required.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Parse and validate body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const allowedPlans = ['free', 'starter', 'pro', 'founding_lifetime'];
  if (!body?.plan || !allowedPlans.includes(body.plan)) {
    return new Response(
      JSON.stringify({ error: `Invalid plan. Must be one of: ${allowedPlans.join(', ')}` }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const updateData: Record<string, any> = {
    plan: body.plan,
    subscriptionStatus: 'active',
    billingCycle: body.plan === 'founding_lifetime' ? 'lifetime' : (body.billingCycle || 'monthly'),
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveDocument('workspaces', workspaceId, updateData, null, env);
    console.log(`[Admin] Plan updated for workspace ${workspaceId} -> ${body.plan} by admin ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId,
        plan: body.plan,
        billingCycle: updateData.billingCycle,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error(`[Admin] Failed to update workspace ${workspaceId}:`, err);
    return new Response(JSON.stringify({ error: 'Failed to update workspace plan in database.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
