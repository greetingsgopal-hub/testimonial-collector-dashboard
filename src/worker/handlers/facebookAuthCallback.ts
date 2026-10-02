import crypto from 'node:crypto';
import { WorkerEnv } from '../types';
import { verifyOAuthState, encryptToken } from '../lib/crypto';
import { exchangeFacebookCode, getFacebookPages } from '../lib/facebookOAuth';
import { saveDocument } from '../lib/firestoreAdmin';
import { checkRateLimit } from '../lib/rateLimit';

/**
 * Facebook OAuth callback - authentication and Page discovery ONLY.
 *
 * Architectural contract (decoupled from import):
 *   1. verify state (CSRF/expiry/user binding)
 *   2. exchange authorization code for a long-lived user token
 *   3. discover the user's Facebook Pages
 *   4. persist the connection with all discovered Pages (tokens encrypted)
 *   5. redirect to the dashboard with an explicit outcome code
 *
 * This callback NEVER imports reviews and NEVER silently selects a Page.
 * Page selection and review import happen in a dedicated, authenticated
 * step (POST /api/facebook/select-page + POST /api/import via the
 * canonical Import Engine) after the user explicitly picks a Page.
 *
 * Outcome codes (distinguish failure stages; never collapse into one
 * generic "authentication failed"):
 *   - fb_oauth_success          OAuth + discovery OK; user must select a Page
 *   - fb_no_pages               OAuth OK but the account manages no Pages
 *   - fb_token_exchange_failed  code exchange against Meta failed
 *   - fb_page_discovery_failed  token OK but /me/accounts failed
 *   - fb_oauth_failed           any other unexpected failure
 */
export async function handleFacebookAuthCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Rate limiting: max 20 attempts per minute per IP
  const rateCheck = checkRateLimit(`facebook_callback_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return redirectWithOutcome(baseUrl, 'fb_rate_limited', 'Too many requests. Please wait a moment.');
  }

  const queryError = url.searchParams.get('error');
  if (queryError) {
    console.warn('[facebook.oauth.callback] Meta returned error param:', queryError);
    return redirectWithOutcome(baseUrl, 'fb_access_denied', 'Facebook authorization was cancelled or denied.');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    console.warn('[facebook.oauth.callback] Missing code or state parameter');
    return redirectWithOutcome(baseUrl, 'fb_oauth_failed', 'Missing authorization parameters from Facebook.');
  }

  // Validate state token against CSRF, expiration, and user binding
  const stateResult = verifyOAuthState(state, env);
  if (!stateResult.valid || !stateResult.userId) {
    console.error('[facebook.oauth.callback] State verification failed:', stateResult.error);
    return redirectWithOutcome(baseUrl, 'fb_oauth_failed', stateResult.error || 'Invalid or expired OAuth state. Please try connecting again.');
  }

  const { userId } = stateResult;

  const appId = env.META_APP_ID || '';
  const appSecret = env.META_APP_SECRET || '';
  const redirectUri = env.FACEBOOK_REDIRECT_URI || `${baseUrl}/api/auth/facebook/callback`;

  if (!appId || !appSecret) {
    console.error('[facebook.oauth.callback] META_APP_ID/META_APP_SECRET missing in environment.');
    return redirectWithOutcome(baseUrl, 'fb_oauth_failed', 'Server configuration error. Contact administrator.');
  }

  // ── Stage 1: token exchange ──────────────────────────────────────────
  let tokenData: { accessToken: string; expiresIn: number };
  try {
    tokenData = await exchangeFacebookCode(code, redirectUri, appId, appSecret);
  } catch (err: any) {
    // Structured diagnostic: stage + sanitized Meta error. No tokens logged.
    console.error(
      JSON.stringify({
        stage: 'facebook.oauth.token_exchange',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        error: sanitizeMetaError(err?.message),
      })
    );
    return redirectWithOutcome(baseUrl, 'fb_token_exchange_failed', 'Facebook authorization could not be completed.');
  }

  // ── Stage 2: Page discovery ──────────────────────────────────────────
  let pages: Awaited<ReturnType<typeof getFacebookPages>>;
  try {
    pages = await getFacebookPages(tokenData.accessToken);
  } catch (err: any) {
    console.error(
      JSON.stringify({
        stage: 'facebook.pages.discovery',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        error: sanitizeMetaError(err?.message),
      })
    );
    return redirectWithOutcome(baseUrl, 'fb_page_discovery_failed', 'Facebook connected, but Panda Praise could not list your Facebook Pages.');
  }

  if (pages.length === 0) {
    console.warn(
      JSON.stringify({
        stage: 'facebook.pages.discovery',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        outcome: 'NO_PAGES_FOUND',
      })
    );
    return redirectWithOutcome(baseUrl, 'fb_no_pages', 'No Facebook Pages were available for this account.');
  }

  // ── Stage 3: persist connection (tokens encrypted, never exposed) ────
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();

  const connectionDoc = {
    ownerId: userId,
    platform: 'facebook',
    platformUserId: pages[0].id,
    platformAccountName: pages[0].name,
    platformProfilePicture: pages[0].profilePicture || null,
    accountType: 'page',
    pageId: null, // Set when the user explicitly selects a Page
    pageName: null,
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category || null,
      pageAccessTokenEncrypted: p.pageAccessToken ? encryptToken(p.pageAccessToken, env) : null,
      profilePicture: p.profilePicture || null,
    })),
    accessTokenEncrypted: encryptToken(tokenData.accessToken, env),
    userAccessTokenEncrypted: encryptToken(tokenData.accessToken, env),
    tokenExpiresAt: expiresAt,
    scopes: ['pages_show_list', 'pages_read_user_content', 'public_profile', 'business_management'],
    status: 'connected',
    pageSelected: false,
    backgroundSyncEnabled: true,
    reviewsSyncedCount: 0,
    connectedAt: now,
    updatedAt: now,
  };

  try {
    await saveDocument('social_connections', `${userId}_facebook`, connectionDoc, undefined, env);
  } catch (err: any) {
    console.error(
      JSON.stringify({
        stage: 'facebook.connection.persist',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        error: sanitizeMetaError(err?.message),
      })
    );
    return redirectWithOutcome(baseUrl, 'fb_oauth_failed', 'Facebook connected, but Panda Praise could not save the connection. Please try again.');
  }

  console.log(
    JSON.stringify({
      stage: 'facebook.pages.discovery',
      provider: 'facebook',
      ownerHash: hashUid(userId),
      outcome: 'OAUTH_SUCCESS',
      pagesFound: pages.length,
    })
  );

  return redirectWithOutcome(baseUrl, 'fb_oauth_success', '', pages.length);
}

/**
 * Redirects to the dashboard Integrate tab with an explicit machine-readable
 * outcome code plus a customer-safe message. The outcome code drives the
 * frontend state machine; the message is display-only.
 */
function redirectWithOutcome(baseUrl: string, outcome: string, message: string, pagesFound?: number): Response {
  const params = new URLSearchParams();
  params.set('fb_outcome', outcome);
  if (message) params.set('social_error', message);
  if (typeof pagesFound === 'number') params.set('fb_pages', String(pagesFound));
  return Response.redirect(`${baseUrl}/dashboard/integrate?${params.toString()}`, 302);
}

/**
 * Opaque server-side identifier for logs; never the raw Firebase UID.
 */
function hashUid(uid: string): string {
  return `uid_${crypto.createHash('sha256').update(uid).digest('hex').slice(0, 12)}`;
}

/**
 * Strips accidental token/secret material from error strings before logging.
 */
function sanitizeMetaError(message: string | undefined): string {
  if (!message) return 'unknown error';
  return message
    .replace(/(EA[A-Za-z0-9]{20,}|access_token[^&\s]*|client_secret[^&\s]*)/gi, '[redacted]')
    .slice(0, 300);
}
