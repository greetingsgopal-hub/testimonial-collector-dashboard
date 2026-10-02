// src/worker/handlers/universalImportHandler.ts
import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { resolveReviewsFromPublicUrl, ExtractedReview } from '../lib/universalExtractor';
import { saveDocument, queryUserDocuments } from '../lib/firestoreAdmin';

/**
 * Route: POST /api/import/resolve-url
 * Resolves public business entity and customer reviews from any supported URL
 * without requiring third-party OAuth authentication.
 */
export async function handleUniversalUrlResolve(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`universal_resolve_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Require authenticated user
  let userId: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) userId = user.uid;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const inputUrl = body.url || body.input || body.link;

    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid review page or public profile URL.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await resolveReviewsFromPublicUrl(inputUrl.trim(), env);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.warn('[UniversalImportHandler] Resolve failure:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Failed to extract reviews from this link. Please verify the URL.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Route: POST /api/import/commit-reviews
 * Commits selected extracted reviews directly into canonical /reviews store.
 */
export async function handleUniversalReviewsCommit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`universal_commit_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many import attempts. Please wait a moment.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let userId: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) userId = user.uid;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const requestedProjectId = typeof body.projectId === 'string' && body.projectId.trim() ? body.projectId.trim() : undefined;
    const platform = body.platform || 'web';
    const sourceUrl = body.sourceUrl || '';
    const reviewsToSave: ExtractedReview[] = Array.isArray(body.reviews) ? body.reviews : (Array.isArray(body.selectedReviews) ? body.selectedReviews : []);

    if (reviewsToSave.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No reviews selected for import.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve tenant project ownership
    let projectId: string | undefined = requestedProjectId;
    if (!projectId) {
      try {
        const projects = await queryUserDocuments('projects', userId, undefined, env);
        const sorted = (projects || [])
          .filter((p: any) => p && typeof p.id === 'string' && p.id.length > 0)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        projectId = sorted[0]?.id;
      } catch (projErr) {
        console.warn('[UniversalImportHandler] Project lookup failed:', projErr);
      }
    }

    let workspaceId = `ws_${userId}`;
    try {
      const workspaces = await queryUserDocuments('workspaces', userId, undefined, env);
      if (workspaces && workspaces.length > 0 && workspaces[0].id) {
        workspaceId = workspaces[0].id;
      }
    } catch (_wErr) {}

    const now = new Date().toISOString();
    const savedDocs: any[] = [];

    for (let idx = 0; idx < reviewsToSave.length; idx++) {
      const rev = reviewsToSave[idx];
      const safeDocId = (rev.id && rev.id.length > 4)
        ? rev.id.replace(/[^a-zA-Z0-9_-]/g, '_')
        : `${platform}_import_${Date.now()}_${idx}`;

      const reviewDoc: any = {
        ownerId: userId,
        workspaceId,
        ...(projectId ? { projectId } : {}),
        name: rev.authorName || 'Customer',
        email: '',
        role: `${platform.toUpperCase()} Reviewer`,
        ...(rev.authorAvatar ? { avatarUrl: rev.authorAvatar } : {}),
        rating: typeof rev.rating === 'number' ? rev.rating : 5,
        content: rev.text || '',
        type: 'text',
        tags: [platform],
        source: platform,
        status: 'approved',
        isFeatured: false,
        consent: true,
        helpfulCount: 0,
        provider: platform,
        externalId: rev.id || safeDocId,
        sourceUrl: rev.platformUrl || sourceUrl,
        importedAt: now,
        createdAt: rev.date || now,
        updatedAt: now,
      };

      try {
        await saveDocument('reviews', safeDocId, reviewDoc, undefined, env);
        savedDocs.push({ id: safeDocId, ...reviewDoc });
      } catch (saveErr) {
        console.warn('[UniversalImportHandler] Review save skipped:', saveErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        importedCount: savedDocs.length,
        totalSubmitted: reviewsToSave.length,
        reviews: savedDocs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[UniversalImportHandler] Commit error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Failed to import reviews into canonical store.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
