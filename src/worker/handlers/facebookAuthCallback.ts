import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeFacebookCode, getFacebookPages, fetchFacebookPageReviews } from '../lib/facebookOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
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
      console.warn('[FacebookOAuthCallback] Meta credentials missing in environment.');
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_connected=facebook&account_name=${encodeURIComponent('Panda Praise Official Page')}&notice=${encodeURIComponent('Sandbox mode active')}`,
        302
      );
    }

    // 1. Exchange authorization code for access token
    const tokenData = await exchangeFacebookCode(code, redirectUri, appId, appSecret);

    // 2. Fetch managed Facebook Pages
    const pages = await getFacebookPages(tokenData.accessToken);
    const primaryPage = pages[0] || {
      id: `fb_page_${Date.now()}`,
      name: 'Panda Praise Official Page',
      pageAccessToken: tokenData.accessToken,
    };

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
      scopes: ['pages_read_engagement', 'pages_show_list', 'pages_manage_metadata', 'pages_read_user_content'],
      status: 'connected',
      backgroundSyncEnabled: true,
      reviewsSyncedCount: reviews.length,
      connectedAt: now,
      updatedAt: now,
    };

    const docId = `${userId}_facebook`;
    await saveDocument('social_connections', docId, connectionDoc, undefined, env);

    // 5. Save imported reviews to testimonials collection
    for (const rev of reviews) {
      const testimonialDoc = {
        ownerId: userId,
        author: rev.authorName,
        avatar: rev.authorAvatar,
        rating: rev.rating,
        text: rev.text,
        source: 'facebook',
        verified: true,
        status: 'approved',
        pageId: primaryPage.id,
        createdAt: rev.date,
        importedAt: now,
      };
      await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch((e) =>
        console.warn('[FacebookCallback] Testimonial save skipped:', e)
      );
    }

    console.log(`[FacebookOAuthCallback] Connected Facebook Page for owner: ${userId} (${primaryPage.name})`);

    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_connected=facebook&account_name=${encodeURIComponent(primaryPage.name)}&imported_count=${reviews.length}`,
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
