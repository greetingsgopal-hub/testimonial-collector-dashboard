import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { fetchGooglePlaceReviews } from '../lib/googleOAuth';
import { saveDocument } from '../lib/firestoreAdmin';

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

  // Check auth if provided, otherwise fallback to demo user
  let userId = 'user_demo_gopal';
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    const user = await verifyFirebaseToken(token || '', env);
    if (user) {
      userId = user.uid;
    }
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const placeInput = body.placeId || body.url || body.input;

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

    // Save reviews to testimonials collection
    for (const rev of result.reviews) {
      const testimonialDoc = {
        ownerId: userId,
        author: rev.authorName,
        avatar: rev.authorAvatar,
        rating: rev.rating,
        text: rev.text,
        source: 'google',
        verified: true,
        status: 'approved',
        placeName: result.placeName,
        createdAt: rev.date,
        importedAt: now,
      };
      await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch((e) =>
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
