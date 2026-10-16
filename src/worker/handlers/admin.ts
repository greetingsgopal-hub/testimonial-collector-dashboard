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
    await saveDocument('workspaces', workspaceId, updateData, null, env);
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

    await saveDocument('workspaces', workspaceId, updateData, null, env);

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
    const headers = await getAuthHeader(null, env);

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
      await deleteDocument('public_reviews', testimonialId, null, env);
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
        null,
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
