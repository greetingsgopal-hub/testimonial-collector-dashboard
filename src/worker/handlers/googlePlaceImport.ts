import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { fetchGooglePlaceDetailsNew, ImportedReview, resolveGoogleMapsUrl, GoogleResolvedPlace } from '../lib/googleOAuth';
import { resolveReviewsFromPublicUrl } from '../lib/universalExtractor';
import { saveDocument, queryUserDocuments } from '../lib/firestoreAdmin';

/**
 * Handles Google Maps / Place resolution and preview.
 * Route: POST /api/google/resolve-place
 */
export async function handleGooglePlaceResolve(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`google_place_resolve_${clientIp}`, 30, 60000);
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
    const inputUrl = body.url || body.input || body.placeId;
    const customApiKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : undefined;

    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid Google Maps link or business name.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectiveApiKey = customApiKey || env.GOOGLE_PLACES_API_KEY;
    let placeResult: GoogleResolvedPlace | null = null;
    let apiKeyError: string | null = null;

    // 1. If API key is available, attempt official Places API (New)
    if (effectiveApiKey) {
      try {
        placeResult = await fetchGooglePlaceDetailsNew(inputUrl.trim(), env, effectiveApiKey);
      } catch (err: any) {
        apiKeyError = err?.message || 'Places API error';
        console.warn('[GooglePlaceResolve] Official Places API failed, falling back to zero-key resolution:', apiKeyError);
      }
    }

    if (placeResult) {
      return new Response(
        JSON.stringify({
          success: true,
          resolved: true,
          place: {
            id: placeResult.placeId,
            name: placeResult.name,
            address: placeResult.address,
            googleMapsUri: placeResult.googleMapsUri,
            rating: placeResult.rating,
            totalReviews: placeResult.totalReviews,
          },
          reviews: placeResult.reviews,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Graceful Zero-API-Key Fallback:
    // Resolve destination URL, extract business name and Place metadata from Google public signals
    const resolution = await resolveGoogleMapsUrl(inputUrl.trim());

    let businessName = resolution.extractedQuery || '';
    if (!businessName && resolution.finalUrl) {
      const pMatch = resolution.finalUrl.match(/\/maps\/place\/([^\/@?]+)/);
      if (pMatch && pMatch[1]) {
        businessName = decodeURIComponent(pMatch[1].replace(/\+/g, ' '));
      }
    }

    // Fallback if URL redirected to generic error or couldn't parse
    if (!businessName && (!resolution.finalUrl || resolution.finalUrl.includes('share.google/error'))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not resolve this Google Maps link. Please verify the URL or search by typing your business name.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Attempt web extractor for public reviews & schema.org metadata
    let webExtracted: any = null;
    if (resolution.finalUrl && resolution.finalUrl.startsWith('http') && !resolution.finalUrl.includes('share.google/error')) {
      try {
        webExtracted = await resolveReviewsFromPublicUrl(resolution.finalUrl, env);
      } catch (_e) {}
    }

    const finalName = businessName || webExtracted?.entity?.name || 'Google Business';
    const finalAddress = webExtracted?.entity?.address || 'Google Maps Location';
    const finalRating = typeof webExtracted?.entity?.rating === 'number' ? webExtracted.entity.rating : 5.0;
    const finalTotal = typeof webExtracted?.entity?.reviewCount === 'number' ? webExtracted.entity.reviewCount : (webExtracted?.reviews?.length || 0);

    const reviews: ImportedReview[] = (webExtracted?.reviews || []).map((r: any, idx: number) => ({
      id: r.id || `google_web_${Date.now()}_${idx}`,
      authorName: r.authorName || 'Google Reviewer',
      authorAvatar: r.authorAvatar,
      rating: r.rating || 5,
      text: r.text || '',
      date: r.date || new Date().toISOString(),
      platformUrl: r.platformUrl || resolution.finalUrl || inputUrl,
      source: 'google' as const,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        resolved: true,
        place: {
          id: resolution.placeId || `google_${Date.now()}`,
          name: finalName,
          address: finalAddress,
          googleMapsUri: resolution.finalUrl || inputUrl,
          rating: finalRating,
          totalReviews: finalTotal,
        },
        reviews,
        requiresApiKey: !effectiveApiKey,
        apiKeyNotice: apiKeyError || 'Resolved via Google Maps public data.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.warn(
      '[GooglePlaceResolve] Failure:',
      JSON.stringify({
        stage: 'resolve_place',
        auth: userId ? 'verified' : 'missing',
        errorName: err?.name || 'Error',
        errorMessage: err?.message || 'unknown',
      })
    );
    const errMsg = err?.message || 'Failed to resolve Google Maps place.';
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handles importing reviews from a resolved Google Place into canonical /reviews.
 * Route: POST /api/google/import-place
 */
export async function handleGooglePlaceImport(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`google_place_import_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many import attempts. Please wait a moment.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Require verified auth
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
        console.warn('[GooglePlaceImport] Project lookup failed:', projErr);
      }
    }

    let workspaceId = `ws_${userId}`;
    try {
      const workspaces = await queryUserDocuments('workspaces', userId, undefined, env);
      if (workspaces && workspaces.length > 0 && workspaces[0].id) {
        workspaceId = workspaces[0].id;
      }
    } catch (_wErr) {}

    let reviewsToSave: ImportedReview[] = [];

    if (Array.isArray(body.reviews) && body.reviews.length > 0) {
      reviewsToSave = body.reviews;
    } else if (Array.isArray(body.selectedReviews) && body.selectedReviews.length > 0) {
      reviewsToSave = body.selectedReviews;
    } else {
      const placeInput = body.placeId || body.url || body.input;
      if (!placeInput || typeof placeInput !== 'string' || !placeInput.trim()) {
        return new Response(
          JSON.stringify({ error: 'Please provide reviews to import or a valid Google Maps link.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const fetched = await fetchGooglePlaceDetailsNew(placeInput.trim(), env);
      reviewsToSave = fetched.reviews;
    }

    const now = new Date().toISOString();
    const savedDocs: any[] = [];

    for (let idx = 0; idx < reviewsToSave.length; idx++) {
      const rev = reviewsToSave[idx];
      const safeDocId = (rev.id && rev.id.startsWith('google_place_'))
        ? rev.id.replace(/[^a-zA-Z0-9_-]/g, '_')
        : `google_place_${Date.now()}_${idx}`;

      const reviewDoc: any = {
        ownerId: userId,
        workspaceId,
        ...(projectId ? { projectId } : {}),
        name: rev.authorName || 'Google User',
        email: '',
        role: 'Google Reviewer',
        ...(rev.authorAvatar ? { avatarUrl: rev.authorAvatar } : {}),
        rating: rev.rating,
        content: rev.text,
        type: 'text',
        tags: [],
        source: 'google',
        status: 'approved',
        isFeatured: false,
        consent: true,
        helpfulCount: 0,
        provider: 'google',
        externalId: rev.id || safeDocId,
        sourceUrl: rev.platformUrl || 'https://maps.google.com',
        importedAt: now,
        createdAt: rev.date || now,
        updatedAt: now,
      };

      try {
        await saveDocument('reviews', safeDocId, reviewDoc, undefined, env);
        savedDocs.push({ id: safeDocId, ...reviewDoc });
      } catch (saveErr) {
        console.warn('[GooglePlaceImport] Save skipped:', saveErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        importedCount: savedDocs.length,
        skippedDuplicates: 0,
        totalSubmitted: reviewsToSave.length,
        reviews: savedDocs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    // Structured diagnostics — stage + error class only. Never logs tokens,
    // API keys, cookies, or review content.
    console.error(
      '[GooglePlaceImport] Failure:',
      JSON.stringify({
        stage: 'import_place',
        auth: userId ? 'verified' : 'missing',
        errorName: err?.name || 'Error',
        errorMessage: err?.message || 'unknown',
      })
    );
    return new Response(
      JSON.stringify({ error: err?.message || 'Failed to import reviews from Google Place.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
