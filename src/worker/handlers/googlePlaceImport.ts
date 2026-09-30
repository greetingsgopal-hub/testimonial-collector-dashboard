import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { fetchGooglePlaceReviews } from '../lib/googleOAuth';
import { saveDocument, queryUserDocuments } from '../lib/firestoreAdmin';

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
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Require verified auth (C4: no demo user fallback, no uid query param trust)
  let userId: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) {
      userId = user.uid;
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const placeInput = body.placeId || body.url || body.input;
    // Optional target project so imported reviews appear in the dashboard
    // (reviews are listed per-project). Falls back to most recent project.
    const requestedProjectId =
      typeof body.projectId === 'string' && body.projectId.trim() ? body.projectId.trim() : '';

    if (!placeInput || typeof placeInput !== 'string' || !placeInput.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid Google Place ID or Google Maps Business link.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await fetchGooglePlaceReviews(placeInput.trim(), env);
    const now = new Date().toISOString();

    let projectId: string | undefined = requestedProjectId;
    if (!projectId) {
      try {
        const projects = await queryUserDocuments('projects', userId, undefined, env);
        const sorted = projects
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

    // Save reviews to the reviews collection (the dashboard reads `reviews`,
    // not `testimonials`) with the full Review doc shape.
    for (const rev of result.reviews) {
      const reviewDoc = {
        ownerId: userId,
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
        createdAt: rev.date || now,
        updatedAt: now,
      };
      // fetchGooglePlaceReviews already generates safe ids (google_place_<ts>_<idx>)
      const docId = rev.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      await saveDocument('reviews', docId, reviewDoc, undefined, env).catch((e) =>
        console.warn('[GooglePlaceImport] Save skipped:', e)
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        placeName: result.placeName,
        rating: result.rating,
        totalReviews: result.totalReviews,
        importedCount: result.reviews.length,
        reviews: result.reviews,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[GooglePlaceImport] Failed to process import:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch reviews from Google Place. Please verify the link or ID.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
