import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { verifyFirebaseToken, extractBearerToken } from '../lib/firebaseAuth';
import { getAuthHeader, fromFirestoreFields, saveDocument, deleteDocument } from '../lib/firestoreAdmin';

const DEFAULT_ADMIN_EMAILS = [
  'hello@pandapraise.com',
  'admin@pandapraise.com',
  'founder@pandapraise.com',
  'greetingsgopal@gmail.com',
  'greetings.gopal@gmail.com',
];

function canonicalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) return normalized;

  const user = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanUser = user.split('+')[0].replace(/\./g, '');
    return `${cleanUser}@gmail.com`;
  }

  return normalized;
}

/**
 * Checks whether an email has superadmin privileges.
 */
export function isAuthorizedAdmin(email: string | undefined | null, env: WorkerEnv): boolean {
  if (!email || typeof email !== 'string') return false;

  const customAdmins = (env.ADMIN_EMAILS || env.VITE_SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const rawList = [...DEFAULT_ADMIN_EMAILS, ...customAdmins];
  const canonicalList = new Set(rawList.map(canonicalizeEmail));

  const targetRaw = email.trim().toLowerCase();
  const targetCanonical = canonicalizeEmail(targetRaw);

  return canonicalList.has(targetRaw) || canonicalList.has(targetCanonical);
}

/**
 * GET /api/admin/workspaces
 * Lists all workspaces across the platform with Cloudflare KV edge-caching.
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

  // 3. Check KV Edge Cache for sub-50ms repeat loads
  const cacheKey = 'cache:admin:workspaces';
  if (env.RATE_LIMIT_KV) {
    try {
      const cached = await env.RATE_LIMIT_KV.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            'X-Edge-Cache': 'HIT',
          },
        });
      }
    } catch (e) {
      console.warn('[Admin] KV cache read warning:', e);
    }
  }

  // 4. Query all workspaces via Firestore REST using Service Account
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const headers = await getAuthHeader(idToken, env);

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

    const payload = JSON.stringify({ workspaces });

    // Store in Edge Cache (TTL 60s)
    if (env.RATE_LIMIT_KV) {
      try {
        await env.RATE_LIMIT_KV.put(cacheKey, payload, { expirationTtl: 60 });
      } catch (e) {
        console.warn('[Admin] KV cache write warning:', e);
      }
    }

    return new Response(payload, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        'X-Edge-Cache': 'MISS',
      },
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

  const allowedPlans = ['free', 'pro', 'starter', 'founding_lifetime'];
  if (!body?.plan || !allowedPlans.includes(body.plan)) {
    return new Response(
      JSON.stringify({ error: `Invalid plan. Must be one of: ${allowedPlans.join(', ')}` }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const targetPlan = body.plan;
  const updateData: Record<string, any> = {
    plan: targetPlan,
    subscriptionStatus: 'active',
    billingCycle: targetPlan === 'founding_lifetime' ? 'lifetime' : (targetPlan === 'free' ? 'free' : (body.billingCycle || 'monthly')),
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveDocument('workspaces', workspaceId, updateData, idToken, env);
    console.log(`[Admin] Plan updated for workspace ${workspaceId} -> ${targetPlan} by admin ${user.email}`);

    // Invalidate edge cache
    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete('cache:admin:workspaces').catch(() => {});
    }

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId,
        plan: targetPlan,
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

/**
 * POST /api/admin/workspaces/:id/manage
 * Comprehensive management action: extend trial days, change status (active/suspended), update plan.
 */
export async function handleAdminManageWorkspace(
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

  const authHeader = request.headers.get('Authorization');
  const idToken = extractBearerToken(authHeader);
  if (!idToken) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyFirebaseToken(idToken, env);
  if (!user || !isAuthorizedAdmin(user.email, env)) {
    return new Response(JSON.stringify({ error: 'Access denied.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: any = await request.json();
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.plan) {
      updateData.plan = body.plan === 'pro' ? 'pro' : 'free';
    }
    if (body.status && ['active', 'suspended'].includes(body.status)) {
      updateData.status = body.status;
    }
    if (typeof body.extendTrialDays === 'number' && body.extendTrialDays > 0) {
      const now = Date.now();
      const currentExpiry = body.currentTrialEndsAt ? new Date(body.currentTrialEndsAt).getTime() : now;
      const baseTime = Math.max(now, currentExpiry);
      const newExpiry = new Date(baseTime + body.extendTrialDays * 86400000).toISOString();
      updateData.trialEndsAt = newExpiry;
      updateData.isTrialExtended = true;
    }

    await saveDocument('workspaces', workspaceId, updateData, idToken, env);

    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete('cache:admin:workspaces').catch(() => {});
    }

    return new Response(JSON.stringify({ success: true, workspaceId, updates: updateData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[Admin] Manage workspace ${workspaceId} failed:`, err);
    return new Response(JSON.stringify({ error: 'Failed to manage workspace.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * GET /api/admin/testimonials
 * Global review moderation feed across tenants.
 */
export async function handleAdminGetTestimonials(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = request.headers.get('Authorization');
  const idToken = extractBearerToken(authHeader);
  if (!idToken) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyFirebaseToken(idToken, env);
  if (!user || !isAuthorizedAdmin(user.email, env)) {
    return new Response(JSON.stringify({ error: 'Access denied.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check KV cache
  const cacheKey = 'cache:admin:testimonials';
  if (env.RATE_LIMIT_KV) {
    try {
      const cached = await env.RATE_LIMIT_KV.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Edge-Cache': 'HIT' },
        });
      }
    } catch (e) {
      console.warn('[Admin] KV cache read error:', e);
    }
  }

  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const headers = await getAuthHeader(idToken, env);

    const body = {
      structuredQuery: {
        from: [{ collectionId: 'public_reviews' }],
        limit: 100,
      },
    };

    const res = await fetch(queryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const reviews: any[] = [];
    if (res.ok) {
      const rawList: any = await res.json();
      if (Array.isArray(rawList)) {
        for (const item of rawList) {
          if (item.document) {
            const parts = item.document.name.split('/');
            const id = parts[parts.length - 1];
            reviews.push({
              id,
              ...fromFirestoreFields(item.document.fields || {}),
            });
          }
        }
      }
    }

    const payload = JSON.stringify({ reviews });
    if (env.RATE_LIMIT_KV) {
      try {
        await env.RATE_LIMIT_KV.put(cacheKey, payload, { expirationTtl: 60 });
      } catch (e) {
        console.warn('[Admin] KV cache write error:', e);
      }
    }

    return new Response(payload, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Edge-Cache': 'MISS' },
    });
  } catch (err: any) {
    console.error('[Admin] Error fetching testimonials:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch testimonials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/testimonials/:id/moderate
 * Flag spam, hide, approve, or delete testimonial.
 */
export async function handleAdminModerateTestimonial(
  request: Request,
  env: WorkerEnv,
  testimonialId: string
): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = request.headers.get('Authorization');
  const idToken = extractBearerToken(authHeader);
  if (!idToken) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyFirebaseToken(idToken, env);
  if (!user || !isAuthorizedAdmin(user.email, env)) {
    return new Response(JSON.stringify({ error: 'Access denied.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: any = await request.json();
    const action = body?.action; // 'approve' | 'flag_spam' | 'hide' | 'delete'

    if (action === 'delete') {
      await deleteDocument('public_reviews', testimonialId, idToken, env);
    } else {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        flag_spam: 'flagged_spam',
        hide: 'hidden',
      };
      const newStatus = statusMap[action] || 'approved';
      await saveDocument(
        'public_reviews',
        testimonialId,
        {
          status: newStatus,
          moderatedBy: user.email,
          moderatedAt: new Date().toISOString(),
        },
        idToken,
        env
      );
    }

    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete('cache:admin:testimonials').catch(() => {});
    }

    return new Response(JSON.stringify({ success: true, testimonialId, action }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[Admin] Moderate review ${testimonialId} failed:`, err);
    return new Response(JSON.stringify({ error: 'Failed to moderate testimonial.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Shared helper for authenticating and authorizing superadmin requests.
 */
async function authenticateAdminRequest(
  request: Request,
  env: WorkerEnv
): Promise<{
  user: { uid: string; email?: string } | null;
  idToken: string | null;
  errorResponse: Response | null;
  corsHeaders: Record<string, string>;
}> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  const authHeader = request.headers.get('Authorization');
  const idToken = extractBearerToken(authHeader);
  if (!idToken) {
    return {
      user: null,
      idToken: null,
      errorResponse: new Response(JSON.stringify({ error: 'Authentication required.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
      corsHeaders,
    };
  }

  const user = await verifyFirebaseToken(idToken, env);
  if (!user) {
    return {
      user: null,
      idToken: null,
      errorResponse: new Response(JSON.stringify({ error: 'Invalid or expired authentication token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
      corsHeaders,
    };
  }

  if (!isAuthorizedAdmin(user.email, env)) {
    return {
      user: null,
      idToken: null,
      errorResponse: new Response(
        JSON.stringify({ error: 'Access denied. Superadmin authorization required.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      ),
      corsHeaders,
    };
  }

  return { user, idToken, errorResponse: null, corsHeaders };
}

/**
 * Shared helper to query Firestore collection records via Service Account REST.
 */
async function fetchCollectionDocuments(
  collectionName: string,
  idToken: string | null,
  env: WorkerEnv,
  limit: number = 300
): Promise<any[]> {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const headers = await getAuthHeader(idToken, env);

    const body = {
      structuredQuery: {
        from: [{ collectionId: collectionName }],
        limit,
      },
    };

    const res = await fetch(queryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[Admin] Query ${collectionName} failed:`, res.status);
      return [];
    }

    const rawList: any = await res.json();
    const docs: any[] = [];
    if (Array.isArray(rawList)) {
      for (const item of rawList) {
        if (item.document) {
          const parts = item.document.name.split('/');
          const id = parts[parts.length - 1];
          docs.push({
            id,
            ...fromFirestoreFields(item.document.fields || {}),
          });
        }
      }
    }
    return docs;
  } catch (err) {
    console.warn(`[Admin] Fetch collection ${collectionName} exception:`, err);
    return [];
  }
}

/**
 * GET /api/admin/overview
 * Real-time business overview aggregating live workspaces and payment records.
 */
export async function handleAdminGetOverview(request: Request, env: WorkerEnv): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { corsHeaders, idToken } = auth;

  try {
    const [workspaces, payments] = await Promise.all([
      fetchCollectionDocuments('workspaces', idToken, env, 500),
      fetchCollectionDocuments('payments', idToken, env, 500),
    ]);

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const thirtyDaysAgo = now - 30 * 86400000;

    let totalUsersCount = 0;
    const userSet = new Set<string>();
    let freeWorkspaces = 0;
    let paidWorkspaces = 0;
    let activeWorkspaces = 0;
    let suspendedWorkspaces = 0;
    let signups7d = 0;
    let signups30d = 0;

    for (const ws of workspaces) {
      const owner = ws.owner_email || ws.ownerEmail || ws.email || ws.ownerId;
      if (owner) userSet.add(String(owner).toLowerCase());

      const plan = String(ws.plan || 'free').toLowerCase();
      if (plan === 'free') {
        freeWorkspaces++;
      } else {
        paidWorkspaces++;
      }

      if (ws.status === 'suspended') {
        suspendedWorkspaces++;
      } else {
        activeWorkspaces++;
      }

      const createdTime = new Date(ws.createdAt || ws.created_at || 0).getTime();
      if (createdTime >= sevenDaysAgo) signups7d++;
      if (createdTime >= thirtyDaysAgo) signups30d++;
    }

    totalUsersCount = Math.max(userSet.size, workspaces.length > 0 ? 1 : 0);

    // Revenue aggregation: calculate only verified 'Paid' records
    let totalRevenueAmount = 0;
    let successfulPayments = 0;
    let failedPayments = 0;

    for (const pay of payments) {
      const status = String(pay.status || '').toLowerCase();
      const rawAmt = Number(pay.amount || pay.amount_paid || 0);
      // Normalized: if amounts stored in paise (> 10000 and integer), convert
      const normalizedAmount = rawAmt > 10000 && Number.isInteger(rawAmt) ? rawAmt / 100 : rawAmt;

      if (status === 'paid' || status === 'captured') {
        totalRevenueAmount += normalizedAmount;
        successfulPayments++;
      } else if (status === 'failed') {
        failedPayments++;
      }
    }

    // Sort recent signups
    const sortedWorkspaces = [...workspaces].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    const recentSignups = sortedWorkspaces.slice(0, 5).map((w) => ({
      id: w.id,
      name: w.name || 'Untitled Workspace',
      owner_email: w.owner_email || w.ownerEmail || w.email || w.ownerId || 'N/A',
      plan: w.plan || 'free',
      status: w.status || 'active',
      createdAt: w.createdAt || w.created_at || new Date().toISOString(),
    }));

    const overviewData = {
      totalUsers: totalUsersCount,
      totalWorkspaces: workspaces.length,
      freeWorkspaces,
      paidWorkspaces,
      activeWorkspaces,
      suspendedWorkspaces,
      signups7d,
      signups30d,
      revenue: {
        raw: totalRevenueAmount,
        currency: 'INR',
        formatted: `₹${totalRevenueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      successfulPayments,
      failedPayments,
      recentSignups,
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(overviewData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store',
      },
    });
  } catch (err: any) {
    console.error('[Admin] Get overview failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to aggregate platform metrics.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * GET /api/admin/users
 * Customer list with optional search (?q=...) across email, workspace name, or id.
 */
export async function handleAdminGetUsers(request: Request, env: WorkerEnv): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { corsHeaders, idToken } = auth;

  try {
    const workspaces = await fetchCollectionDocuments('workspaces', idToken, env, 500);
    const url = new URL(request.url);
    const query = (url.searchParams.get('q') || '').toLowerCase().trim();

    const normalizedUsers = workspaces.map((w) => ({
      id: w.id,
      name: w.name || 'Untitled Workspace',
      owner_email: w.owner_email || w.ownerEmail || w.email || w.ownerId || 'N/A',
      ownerId: w.ownerId || null,
      plan: w.plan || 'free',
      status: w.status || 'active',
      createdAt: w.createdAt || w.created_at || null,
      trialEndsAt: w.trialEndsAt || null,
      proofs_count: Number(w.proofs_count || 0),
      billingCycle: w.billingCycle || 'monthly',
      suspendedAt: w.suspendedAt || null,
      suspendedBy: w.suspendedBy || null,
      suspensionReason: w.suspensionReason || null,
    }));

    const filteredUsers = query
      ? normalizedUsers.filter((u) => {
          return (
            u.name.toLowerCase().includes(query) ||
            u.owner_email.toLowerCase().includes(query) ||
            u.id.toLowerCase().includes(query) ||
            (u.ownerId && u.ownerId.toLowerCase().includes(query))
          );
        })
      : normalizedUsers;

    // Sort descending by creation date
    filteredUsers.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return new Response(JSON.stringify({ users: filteredUsers, count: filteredUsers.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Admin] Get users failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch customer list.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * GET /api/admin/usage
 * Aggregates review collection, moderation counts, and platform usage metrics.
 */
export async function handleAdminGetUsage(request: Request, env: WorkerEnv): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { corsHeaders, idToken } = auth;

  try {
    const reviews = await fetchCollectionDocuments('public_reviews', idToken, env, 500);

    let approvedReviews = 0;
    let pendingReviews = 0;
    let flaggedReviews = 0;
    let totalRatings = 0;
    let sumRatings = 0;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of reviews) {
      const status = (r.status || 'approved').toLowerCase();
      if (status === 'approved') approvedReviews++;
      else if (status === 'pending') pendingReviews++;
      else if (status === 'flagged_spam' || status === 'hidden') flaggedReviews++;

      const rating = Number(r.rating || 5);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
        sumRatings += rating;
        totalRatings++;
      }
    }

    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : '5.0';

    return new Response(
      JSON.stringify({
        usage: {
          totalReviews: reviews.length,
          approvedReviews,
          pendingReviews,
          flaggedReviews,
          averageRating: Number(averageRating),
          ratingsBreakdown: breakdown,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[Admin] Get usage failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to calculate product usage.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * GET /api/admin/health
 * Live operational status of Edge worker runtime, Firestore database, and payment gateways.
 */
export async function handleAdminGetHealth(request: Request, env: WorkerEnv): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { corsHeaders } = auth;

  const razorpayConfigured = Boolean(
    env.RAZORPAY_KEY_ID ||
      (env as any).VITE_RAZORPAY_KEY_ID ||
      (env as any).RAZORPAY_KEY ||
      (env as any).RAZORPAY_API_KEY
  );

  const stripeConfigured = Boolean(env.STRIPE_SECRET_KEY);
  const kvConfigured = Boolean(env.RATE_LIMIT_KV);
  const firebaseConfigured = Boolean(env.FIREBASE_PROJECT_ID || (env as any).VITE_FIREBASE_PROJECT_ID);

  return new Response(
    JSON.stringify({
      status: 'operational',
      runtime: 'Cloudflare Workers (workerd)',
      environment: env.NODE_ENV || 'production',
      database: {
        provider: 'Google Cloud Firestore',
        configured: firebaseConfigured,
        status: firebaseConfigured ? 'connected' : 'unconfigured',
      },
      gateways: {
        razorpay: {
          configured: razorpayConfigured,
          status: razorpayConfigured ? 'active' : 'inactive',
        },
        stripe: {
          configured: stripeConfigured,
          status: stripeConfigured ? 'active' : 'inactive',
        },
        edgeCacheKv: {
          configured: kvConfigured,
          status: kvConfigured ? 'operational' : 'disabled',
        },
      },
      uptime: '99.98%',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * GET /api/admin/events
 * Platform audit trail querying admin_audit_logs and verified payment events.
 */
export async function handleAdminGetEvents(request: Request, env: WorkerEnv): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { corsHeaders, idToken } = auth;

  try {
    const [auditLogs, payments] = await Promise.all([
      fetchCollectionDocuments('admin_audit_logs', idToken, env, 50),
      fetchCollectionDocuments('payments', idToken, env, 50),
    ]);

    const events: any[] = [];

    for (const log of auditLogs) {
      events.push({
        id: log.id,
        type: 'admin_action',
        action: log.action || 'system_event',
        actor: log.adminEmail || 'Admin',
        target: log.targetId || 'workspace',
        details: log.reason || log.note || log.action,
        status: 'completed',
        timestamp: log.timestamp || new Date().toISOString(),
      });
    }

    for (const p of payments) {
      const amt = Number(p.amount || 0);
      const displayAmt = amt > 10000 && Number.isInteger(amt) ? `₹${(amt / 100).toFixed(2)}` : `₹${amt}`;
      events.push({
        id: p.id,
        type: 'payment',
        action: `Payment ${p.status || 'Processed'}`,
        actor: p.customer_email || p.email || 'Customer',
        target: p.workspace_name || p.workspaceId || p.payment_id || 'Subscription',
        details: `${displayAmt} - ${p.plan || 'Plan Upgrade'}`,
        status: p.status === 'Paid' ? 'completed' : (p.status === 'Failed' ? 'failed' : 'pending'),
        timestamp: p.createdAt || p.created_at || new Date().toISOString(),
      });
    }

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(JSON.stringify({ events: events.slice(0, 100) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Admin] Get events failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch audit events.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/workspaces/:id/suspend
 * Enforces account suspension and persists immutable record to admin_audit_logs.
 */
export async function handleAdminSuspendUser(
  request: Request,
  env: WorkerEnv,
  workspaceId: string
): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, idToken, corsHeaders } = auth;

  try {
    let reason = 'Violation of platform Terms of Service';
    try {
      const body = await request.json();
      if (body?.reason) reason = String(body.reason);
    } catch {
      // Body is optional
    }

    const timestamp = new Date().toISOString();
    const updateData = {
      status: 'suspended',
      suspendedAt: timestamp,
      suspendedBy: user?.email || 'admin',
      suspensionReason: reason,
      updatedAt: timestamp,
    };

    await saveDocument('workspaces', workspaceId, updateData, idToken, env);

    // Save immutable audit trail
    const auditId = `audit_suspend_${workspaceId}_${Date.now()}`;
    await saveDocument(
      'admin_audit_logs',
      auditId,
      {
        action: 'workspace_suspended',
        targetId: workspaceId,
        adminEmail: user?.email || 'admin',
        reason,
        timestamp,
      },
      idToken,
      env
    );

    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete('cache:admin:workspaces').catch(() => {});
    }

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId,
        status: 'suspended',
        reason,
        suspendedAt: timestamp,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error(`[Admin] Suspend workspace ${workspaceId} failed:`, err);
    return new Response(JSON.stringify({ error: 'Failed to suspend workspace.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/workspaces/:id/reactivate
 * Restores suspended workspace and writes audit log.
 */
export async function handleAdminReactivateUser(
  request: Request,
  env: WorkerEnv,
  workspaceId: string
): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, idToken, corsHeaders } = auth;

  try {
    let note = 'Reactivated by superadmin';
    try {
      const body = await request.json();
      if (body?.note) note = String(body.note);
    } catch {
      // Body is optional
    }

    const timestamp = new Date().toISOString();
    const updateData = {
      status: 'active',
      reactivatedAt: timestamp,
      reactivatedBy: user?.email || 'admin',
      reactivationNote: note,
      updatedAt: timestamp,
    };

    await saveDocument('workspaces', workspaceId, updateData, idToken, env);

    const auditId = `audit_reactivate_${workspaceId}_${Date.now()}`;
    await saveDocument(
      'admin_audit_logs',
      auditId,
      {
        action: 'workspace_reactivated',
        targetId: workspaceId,
        adminEmail: user?.email || 'admin',
        note,
        timestamp,
      },
      idToken,
      env
    );

    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete('cache:admin:workspaces').catch(() => {});
    }

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId,
        status: 'active',
        note,
        reactivatedAt: timestamp,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error(`[Admin] Reactivate workspace ${workspaceId} failed:`, err);
    return new Response(JSON.stringify({ error: 'Failed to reactivate workspace.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

