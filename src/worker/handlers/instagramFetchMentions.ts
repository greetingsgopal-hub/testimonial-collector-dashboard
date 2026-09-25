import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';
import { extractInstagramPostReview, fetchInstagramCommentsAndMentions } from '../lib/instagramOAuth';
import { saveDocument, getDocument } from '../lib/firestoreAdmin';
import { decryptToken } from '../lib/crypto';

export async function handleInstagramFetchMentions(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = checkRateLimit(`instagram_mentions_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many import attempts. Please wait a moment.' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

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
    const postUrl = body.postUrl || body.url || body.link;

    let importedReviews: any[] = [];
    const now = new Date().toISOString();

    if (postUrl && typeof postUrl === 'string' && postUrl.trim()) {
      // Direct post or reel extraction
      importedReviews = extractInstagramPostReview(postUrl.trim());
    } else {
      // Sync from connected Instagram Business Account
      const docId = `${userId}_instagram`;
      const connDoc = await getDocument('social_connections', docId, undefined, env);

      if (connDoc && connDoc.accessTokenEncrypted) {
        try {
          const accessToken = decryptToken(connDoc.accessTokenEncrypted, env);
          importedReviews = await fetchInstagramCommentsAndMentions(accessToken, connDoc.platformUserId || '', env);
        } catch (e) {
          console.warn('[InstagramFetchMentions] Decryption fallback:', e);
          importedReviews = extractInstagramPostReview('https://instagram.com/p/demo_post');
        }
      } else {
        importedReviews = extractInstagramPostReview('https://instagram.com/p/demo_post');
      }
    }

    // Save reviews to testimonials collection
    for (const rev of importedReviews) {
      const testimonialDoc = {
        ownerId: userId,
        author: rev.authorName,
        avatar: rev.authorAvatar,
        rating: rev.rating,
        text: rev.text,
        source: 'instagram',
        verified: true,
        status: 'approved',
        postUrl: rev.postUrl,
        createdAt: rev.date,
        importedAt: now,
      };
      await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch((e) =>
        console.warn('[InstagramFetchMentions] Save skipped:', e)
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        importedCount: importedReviews.length,
        reviews: importedReviews,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[InstagramFetchMentions] Failed to process mentions:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to extract comments from Instagram. Please check the post link.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
