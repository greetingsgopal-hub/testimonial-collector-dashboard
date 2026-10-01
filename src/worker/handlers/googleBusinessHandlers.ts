import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import {
  listGoogleBusinessAccountsAndLocations,
  fetchGoogleBusinessLocationReviews,
} from '../lib/googleOAuth';
import { getDocument } from '../lib/firestoreAdmin';
import { decryptToken } from '../lib/crypto';
import { saveReviewsBatch, isDuplicate, resolveUserOwnership, validateExternalId } from '../lib/firestore';

/**
 * Resolves the Google access token for an authenticated user:
 * Either provided directly in request body, or retrieved from encrypted Firestore connection record.
 */
async function resolveGoogleAccessToken(
  userId: string,
  explicitToken?: string | null,
  env?: WorkerEnv
): Promise<string | null> {
  if (explicitToken && typeof explicitToken === 'string' && explicitToken.trim()) {
    return explicitToken.trim();
  }

  if (!env) return null;

  try {
    const connectionDoc = await getDocument('social_connections', `${userId}_google`, null, env);
    if (connectionDoc && connectionDoc.accessTokenEncrypted) {
      const decrypted = decryptToken(connectionDoc.accessTokenEncrypted, env);
      return decrypted || null;
    }
  } catch (err) {
    console.warn('[GoogleBusiness] Failed to read social_connection token:', err);
  }

  return null;
}

/**
 * Discovers connected Google Business Profile businesses & locations.
 * Route: POST /api/google/discover-businesses
 */
export async function handleGoogleBusinessDiscover(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate Limiting
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`google_business_discover_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify auth
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
    const accessToken = await resolveGoogleAccessToken(userId, body.authToken, env);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'AUTH_REQUIRED',
          error: 'Google account is not connected. Please connect your Google account first.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locations = await listGoogleBusinessAccountsAndLocations(accessToken);

    return new Response(
      JSON.stringify({
        success: true,
        businesses: locations,
        count: locations.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[GoogleBusinessDiscover] Discovery error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Failed to discover Google Business Profile locations.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Previews reviews for a specific Google Business Profile location.
 * Route: POST /api/google/preview-business-reviews
 */
export async function handleGoogleBusinessPreviewReviews(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate Limiting
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`google_business_preview_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify auth
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
    const accessToken = await resolveGoogleAccessToken(userId, body.authToken, env);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'AUTH_REQUIRED',
          error: 'Google account is not connected.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { accountName, locationName, locationId } = body;
    const targetLocation = locationName || locationId;

    if (!accountName || !targetLocation) {
      return new Response(
        JSON.stringify({ success: false, error: 'accountName and locationName are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviews = await fetchGoogleBusinessLocationReviews(accessToken, accountName, targetLocation);

    return new Response(
      JSON.stringify({
        success: true,
        reviews,
        count: reviews.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[GoogleBusinessPreview] Error fetching reviews:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Failed to retrieve reviews from Google Business Profile.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Imports selected reviews from a Google Business Profile location into canonical /reviews.
 * Route: POST /api/google/import-business-reviews
 */
export async function handleGoogleBusinessImportReviews(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify auth
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

    // Resolve tenant ownership hierarchy
    const ownership = await resolveUserOwnership(userId, requestedProjectId, env);
    const { workspaceId, projectId } = ownership;

    let reviewsToSave: any[] = [];
    if (Array.isArray(body.selectedReviews) && body.selectedReviews.length > 0) {
      reviewsToSave = body.selectedReviews;
    } else if (Array.isArray(body.reviews) && body.reviews.length > 0) {
      reviewsToSave = body.reviews;
    } else {
      return new Response(
        JSON.stringify({ error: 'No reviews selected for import.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tenant-scoped deduplication
    const deduplicatedReviews: any[] = [];
    for (const rev of reviewsToSave) {
      try {
        const safeExtId = validateExternalId(rev.id || `google_bp_${Date.now()}`);
        const dup = await isDuplicate(userId, 'google', safeExtId, env);
        if (!dup) {
          deduplicatedReviews.push({
            author: rev.authorName || rev.author,
            avatarUrl: rev.authorAvatar || rev.avatarUrl,
            rating: typeof rev.rating === 'number' ? rev.rating : 5,
            text: rev.text || rev.content || '',
            createdAt: rev.date || rev.createdAt,
            externalId: safeExtId,
            sourceUrl: rev.platformUrl || 'https://maps.google.com',
          });
        }
      } catch (_err) {
        continue;
      }
    }

    let savedDocs: any[] = [];
    if (deduplicatedReviews.length > 0) {
      savedDocs = await saveReviewsBatch(
        userId,
        workspaceId,
        projectId,
        'google',
        body.locationName || body.businessName || 'google_business',
        deduplicatedReviews,
        env
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        importedCount: savedDocs.length,
        skippedDuplicates: reviewsToSave.length - deduplicatedReviews.length,
        totalSubmitted: reviewsToSave.length,
        reviews: savedDocs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[GoogleBusinessImport] Import failed:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Failed to import Google Business Profile reviews.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
