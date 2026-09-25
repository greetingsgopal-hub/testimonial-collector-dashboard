import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeGoogleCode, getGoogleUserProfile, fetchGoogleBusinessReviews } from '../lib/googleOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
import { checkRateLimit } from '../lib/rateLimit';

export async function handleGoogleAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate limiting on callback: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`google_callback_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Too many requests. Please wait a moment.')}`,
      302
    );
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[GoogleOAuthCallback] Google returned error:', queryError);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Google authorization was cancelled or denied.')}`,
      302
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Missing authorization parameters from Google.')}`,
      302
    );
  }

  // Validate state (CSRF + user binding + 10-minute expiry + HMAC integrity)
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId) {
    console.error('[GoogleOAuthCallback] State verification failed:', stateResult.error);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent(stateResult.error || 'Invalid or expired Google OAuth state.')}`,
      302
    );
  }

  const { userId } = stateResult;

  try {
    const clientId = env.GOOGLE_CLIENT_ID || '';
    const clientSecret = env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.warn('[GoogleOAuthCallback] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in environment.');
      return Response.redirect(
        `${baseUrl}/dashboard?social_connected=google&account_name=${encodeURIComponent('Google Business Profile')}&notice=${encodeURIComponent('Simulated connection active')}`,
        302
      );
    }

    // 1. Exchange authorization code for access & refresh tokens
    const tokenData = await exchangeGoogleCode(code, redirectUri, clientId, clientSecret);

    // 2. Fetch Google User Profile
    const profile = await getGoogleUserProfile(tokenData.access_token);

    // 3. Fetch Google Business / Places Reviews
    const reviews = await fetchGoogleBusinessReviews(tokenData.access_token, env);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // 4. Save encrypted connection record to Firestore
    const connectionDoc = {
      ownerId: userId,
      platform: 'google',
      platformUserId: profile.sub,
      platformAccountName: profile.name || profile.email || 'Google Business Account',
      platformEmail: profile.email || null,
      platformProfilePicture: profile.picture || null,
      accountType: 'business',
      accessTokenEncrypted: encryptToken(tokenData.access_token, env),
      refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token, env) : null,
      tokenExpiresAt: expiresAt,
      scopes: ['openid', 'userinfo.profile', 'userinfo.email', 'business.manage'],
      status: 'connected',
      reviewsSyncedCount: reviews.length,
      connectedAt: now,
      updatedAt: now,
    };

    const docId = `${userId}_google`;
    await saveDocument('social_connections', docId, connectionDoc, undefined, env);

    // 5. Save imported reviews to testimonials collection
    for (const rev of reviews) {
      const testimonialDoc = {
        ownerId: userId,
        author: rev.authorName,
        avatar: rev.authorAvatar,
        rating: rev.rating,
        text: rev.text,
        source: 'google',
        verified: true,
        status: 'approved',
        createdAt: rev.date,
        importedAt: now,
      };
      await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch((e) =>
        console.warn('[GoogleCallback] Testimonial save skipped:', e)
      );
    }

    console.log(`[GoogleOAuthCallback] Connected Google for owner: ${userId} (${profile.name}), imported ${reviews.length} reviews`);

    return Response.redirect(
      `${baseUrl}/dashboard?social_connected=google&account_name=${encodeURIComponent(profile.name)}&imported_count=${reviews.length}`,
      302
    );
  } catch (err: any) {
    console.error('[GoogleOAuthCallback] Failed to complete Google OAuth exchange:', err);
    return Response.redirect(
      `${baseUrl}/dashboard?social_error=${encodeURIComponent('Failed to complete Google authentication. Please try again.')}`,
      302
    );
  }
}
