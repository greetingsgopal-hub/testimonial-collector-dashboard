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
    const postUrl = body.postUrl || body.url || body.link;

    let importedReviews: any[] = [];
    const now = new Date().toISOString();

    if (postUrl && typeof postUrl === 'string' && postUrl.trim()) {
      // Direct post/reel extraction requires the authenticated Graph API.
      // A bare URL alone cannot yield real comment data — never fabricate.
      importedReviews = extractInstagramPostReview(postUrl.trim());
      if (importedReviews.length === 0) {
        return new Response(
          JSON.stringify({
            error:
              'Direct link import is not available. Connect your Instagram Business account, then sync comments from your connected account instead.',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
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
          importedReviews = [];
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'No connected Instagram account found. Connect Instagram first.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
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
