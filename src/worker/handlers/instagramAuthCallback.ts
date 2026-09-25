import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeInstagramCode, getInstagramBusinessAccount, fetchInstagramCommentsAndMentions } from '../lib/instagramOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleInstagramAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate limiting: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`instagram_callback_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      302
    );
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[InstagramOAuthCallback] Meta returned error:', queryError);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Instagram authorization was cancelled or denied.')}`,
      302
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Missing authorization parameters from Instagram.')}`,
      302
    );
  }

  // Validate state token against CSRF, expiration, and user binding
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId) {
    console.error('[InstagramOAuthCallback] State verification failed:', stateResult.error);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired OAuth state.')}`,
      302
    );
  }

  const { userId } = stateResult;

  try {
    const appId = env.META_APP_ID || '';
    const appSecret = env.META_APP_SECRET || '';
    const redirectUri = env.INSTAGRAM_REDIRECT_URI || `${baseUrl}/api/auth/instagram/callback`;

    if (!appId || !appSecret) {
      console.warn('[InstagramOAuthCallback] Meta credentials missing in environment.');
      return Response.redirect(
        `${baseUrl}/dashboard/integrate?social_connected=instagram&account_name=${encodeURIComponent('@pandapraise_official')}&notice=${encodeURIComponent('Sandbox mode active')}`,
        302
      );
    }

    // 1. Exchange authorization code for access token
    const tokenData = await exchangeInstagramCode(code, redirectUri, appId, appSecret);

    // 2. Fetch authenticated Instagram Business account
    const account = await getInstagramBusinessAccount(tokenData.accessToken);

    // 3. Fetch recent comments and mentions
    const reviews = await fetchInstagramCommentsAndMentions(tokenData.accessToken, account.id, env);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();

    // 4. Encrypt and store connection document in Firestore
    const connectionDoc = {
      ownerId: userId,
      platform: 'instagram',
      platformUserId: account.id,
      platformAccountName: `@${account.username}`,
      platformProfilePicture: account.profilePicture || null,
      accountType: 'business',
      accessTokenEncrypted: encryptToken(tokenData.accessToken, env),
      tokenExpiresAt: expiresAt,
      scopes: ['instagram_basic', 'instagram_manage_comments', 'pages_show_list'],
      status: 'connected',
      commentsSyncedCount: reviews.length,
      connectedAt: now,
      updatedAt: now,
    };

    const docId = `${userId}_instagram`;
    await saveDocument('social_connections', docId, connectionDoc, undefined, env);

    // 5. Save imported comments to testimonials collection
    for (const rev of reviews) {
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
        console.warn('[InstagramCallback] Testimonial save skipped:', e)
      );
    }

    console.log(`[InstagramOAuthCallback] Connected Instagram for owner: ${userId} (${account.username})`);

    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_connected=instagram&account_name=${encodeURIComponent(account.username)}&imported_count=${reviews.length}`,
      302
    );
  } catch (err: any) {
    console.error('[InstagramOAuthCallback] Failed to complete OAuth exchange:', err);
    return Response.redirect(
      `${baseUrl}/dashboard/integrate?social_error=${encodeURIComponent('Failed to complete Instagram authentication. Please try again.')}`,
      302
    );
  }
}
