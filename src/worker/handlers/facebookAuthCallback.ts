import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeFacebookCode, getFacebookPages, fetchFacebookPageReviews } from '../lib/facebookOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
import { resolveUserOwnership, isDuplicate, validateExternalId, saveReviewsBatch } from '../lib/firestore';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleFacebookAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate limiting: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`facebook_callback_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      302
    );
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[FacebookOAuthCallback] Meta returned error:', queryError);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Facebook authorization was cancelled or denied.')}`,
      302
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Missing authorization parameters from Facebook.')}`,
      302
    );
  }

  // Validate state token against CSRF, expiration, and user binding
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId) {
    console.error('[FacebookOAuthCallback] State verification failed:', stateResult.error);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired OAuth state.')}`,
      302
    );
  }

  const { userId } = stateResult;

  try {
    const appId = env.META_APP_ID || '';
    const appSecret = env.META_APP_SECRET || '';
    const redirectUri = env.FACEBOOK_REDIRECT_URI || `${baseUrl}/api/auth/facebook/callback`;

    if (!appId || !appSecret) {
      console.error('[FacebookOAuthCallback] Meta credentials missing in environment.');
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Server configuration error. Contact administrator.')}`,
        302
      );
    }

    // 1. Exchange authorization code for access token
    const tokenData = await exchangeFacebookCode(code, redirectUri, appId, appSecret);

    // 2. Fetch managed Facebook Pages
    const pages = await getFacebookPages(tokenData.accessToken);
    const primaryPage = pages[0];
    if (!primaryPage) {
      throw new Error(
        'No Facebook Pages found for this account. Create a Facebook Page and grant the app access, then try again.'
      );
    }

    // 3. Fetch initial ratings and recommendations
    const pageToken = primaryPage.pageAccessToken || tokenData.accessToken;
    const reviews = await fetchFacebookPageReviews(pageToken, primaryPage.id, env);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();

    // 4. Encrypt and store connection document in Firestore
    const connectionDoc = {
      ownerId: userId,
      platform: 'facebook',
      platformUserId: primaryPage.id,
      platformAccountName: primaryPage.name,
      platformProfilePicture: primaryPage.profilePicture || null,
      accountType: 'page',
      pageId: primaryPage.id,
      pageName: primaryPage.name,
      accessTokenEncrypted: encryptToken(pageToken, env),
      userAccessTokenEncrypted: encryptToken(tokenData.accessToken, env),
      tokenExpiresAt: expiresAt,
      scopes: ['pages_show_list', 'pages_read_user_content'],
      status: 'connected',
      backgroundSyncEnabled: true,
      reviewsSyncedCount: reviews.length,
      connectedAt: now,
      updatedAt: now,
    };

    const docId = `${userId}_facebook`;
    await saveDocument('social_connections', docId, connectionDoc, undefined, env);

    // 5. Import page reviews into the canonical `reviews` collection (the
    // dashboard reads `reviews` — nothing reads a `testimonials` collection).
    // OAuth success never implies import success: reviews are only saved when
    // the Graph API actually returns them, with tenant-scoped dedupe.
    let importedCount = 0;
    if (reviews.length > 0) {
      const ownership = await resolveUserOwnership(userId, undefined, env);
      const deduped: any[] = [];
      for (const rev of reviews) {
        try {
          const externalId = validateExternalId(rev.id);
          if (!(await isDuplicate(userId, 'facebook', externalId, env))) {
            deduped.push({
              author: rev.authorName,
              avatarUrl: rev.authorAvatar,
              rating: typeof rev.rating === 'number' ? rev.rating : 5,
              text: rev.text,
              createdAt: rev.date,
              externalId,
              sourceUrl: rev.postUrl || `https://facebook.com/${primaryPage.id}`,
            });
          }
        } catch (_err) {
          continue;
        }
      }
      if (deduped.length > 0) {
        await saveReviewsBatch(
          userId,
          ownership.workspaceId,
          ownership.projectId,
          'facebook',
          primaryPage.id,
          deduped,
          env
        );
        importedCount = deduped.length;
      }
    }

    console.log(`[FacebookOAuthCallback] Connected Facebook Page for owner: ${userId} (${primaryPage.name})`);

    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_connected=facebook&account_name=${encodeURIComponent(primaryPage.name)}&imported_count=${importedCount}`,
      302
    );
  } catch (err: any) {
    console.error('[FacebookOAuthCallback] Failed to complete OAuth exchange:', err);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Failed to complete Facebook authentication. Please try again.')}`,
      302
    );
  }
}
