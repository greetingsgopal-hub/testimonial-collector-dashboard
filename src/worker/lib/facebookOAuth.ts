import { WorkerEnv } from '../types';
import crypto from 'node:crypto';

/**
 * Graph API version pin.
 *
 * v26.0 is the latest Graph API version (released 2026-07-29) per Meta's
 * official changelog (developers.facebook.com/docs/graph-api/changelog/).
 * The previously hardcoded v19.0 EXPIRED on 2026-05-2026 (Meta versions
 * table) - every call to it failed, which was the root cause of the
 * production "Failed to complete Facebook authentication" error: the
 * OAuth token exchange hit a dead API version and fell into the callback's
 * generic catch.
 */
export const GRAPH_API_VERSION = 'v26.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface FacebookPageInfo {
  id: string;
  name: string;
  category?: string | null;
  pageAccessToken?: string;
  profilePicture?: string | null;
}

export interface FacebookReviewItem {
  id: string;
  authorName: string | null;
  authorAvatar: string | null;
  rating: number | null;
  text: string;
  date: string | null;
  source: 'facebook';
  pageId?: string;
  postUrl?: string;
}

/**
 * Extracts a sanitized, log-safe description of a Graph API error.
 * NEVER includes the request URL (which carries the access token) or the
 * token itself - only HTTP status plus Meta's error code/type/message.
 */
function describeGraphError(status: number, body: string): string {
  let metaMessage = body.slice(0, 300);
  let metaCode: number | undefined;
  let metaType: string | undefined;
  try {
    const parsed = JSON.parse(body);
    metaMessage = parsed?.error?.message || metaMessage;
    metaCode = parsed?.error?.code;
    metaType = parsed?.error?.type;
  } catch {
    // non-JSON body - keep the truncated raw text
  }
  return `HTTP ${status}${metaCode ? ` code ${metaCode}` : ''}${metaType ? ` (${metaType})` : ''}: ${metaMessage}`;
}

/**
 * Deterministic external ID for a Facebook rating/recommendation.
 *
 * Uses the real Graph rating node id when Meta provides one. When it does
 * not, derives a stable SHA-256 hash from immutable source fields - never
 * Date.now() (which breaks dedupe and creates duplicate identities on
 * every fetch).
 */
export function buildFacebookReviewExternalId(pageId: string, r: any): string {
  if (r?.id) return `fb_rating_${String(r.id)}`;
  const stable = `${pageId}|${r?.reviewer?.id || ''}|${r?.created_time || ''}|${r?.review_text || ''}`;
  return `fb_rating_${crypto.createHash('sha256').update(stable).digest('hex').slice(0, 32)}`;
}

/**
 * Builds the Meta OAuth 2.0 authorization URL.
 *
 * Scope set matches the production Meta app's "Manage everything on your
 * Page" use case (required: business_management, pages_show_list,
 * public_profile; optional enabled: pages_read_user_content):
 * - pages_show_list: GET /me/accounts - discover the user's Pages and
 *   obtain per-Page access tokens.
 * - pages_read_user_content: required by the Page ratings edge
 *   (GET /{page-id}/ratings) per Meta's Graph API reference.
 * - business_management: required permission of the app's Page use case.
 * - public_profile: standard login permission.
 *
 * The `email` scope is NOT requested (it triggered Invalid Scopes against
 * the production app configuration and is not needed for Page reviews).
 */
export function buildFacebookAuthUrl(state: string, appId: string, redirectUri: string): string {
  const scopes = [
    'pages_show_list',
    'pages_read_user_content',
    'public_profile',
    'business_management',
  ].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: state,
    scope: scopes,
    response_type: 'code',
  });

  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Exchanges the OAuth authorization code for a long-lived Meta user token.
 * Throws on failure - never returns a fabricated or partial token.
 */
export async function exchangeFacebookCode(
  code: string,
  redirectUri: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const cleanAppId = appId.trim();
  const cleanSecret = appSecret.trim();
  const cleanRedirectUri = redirectUri.trim();
  const cleanCode = code.trim();

  const tokenUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', cleanAppId);
  tokenUrl.searchParams.set('client_secret', cleanSecret);
  tokenUrl.searchParams.set('redirect_uri', cleanRedirectUri);
  tokenUrl.searchParams.set('code', cleanCode);

  const res = await fetch(tokenUrl.toString());
  if (!res.ok) {
    const errText = await res.text();
    const description = describeGraphError(res.status, errText);
    console.error('[FacebookOAuth] Token exchange failed:', description);
    throw new Error(`Facebook token exchange failed (${description})`);
  }

  const tokenData: any = await res.json();
  const shortLivedToken = tokenData.access_token;
  if (!shortLivedToken) {
    throw new Error('Facebook token exchange returned no access token');
  }

  // Exchange for a long-lived (~60 day) user token. The short-lived token
  // remains usable if this upgrade fails, so a failure is logged, not thrown.
  try {
    const longTokenUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
    longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longTokenUrl.searchParams.set('client_id', cleanAppId);
    longTokenUrl.searchParams.set('client_secret', cleanSecret);
    longTokenUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const longRes = await fetch(longTokenUrl.toString());
    if (longRes.ok) {
      const longData: any = await longRes.json();
      return {
        accessToken: longData.access_token || shortLivedToken,
        expiresIn: longData.expires_in || tokenData.expires_in || 5184000,
      };
    }
    console.warn('[FacebookOAuth] Long-lived token upgrade failed:', describeGraphError(longRes.status, await longRes.text()));
  } catch (e) {
    console.warn('[FacebookOAuth] Long-lived token upgrade error, using short-lived token:', (e as Error).message);
  }

  return {
    accessToken: shortLivedToken,
    expiresIn: tokenData.expires_in || 5184000,
  };
}

/**
 * Fetches the Facebook Pages the user manages, with per-Page access tokens.
 * Throws on API failure - never returns fabricated Pages.
 */
export async function getFacebookPages(userAccessToken: string): Promise<FacebookPageInfo[]> {
  const url = `${GRAPH_BASE}/me/accounts?fields=id,name,category,access_token,picture{url}&access_token=${encodeURIComponent(
    userAccessToken
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    const description = describeGraphError(res.status, errText);
    console.error('[FacebookOAuth] Page discovery failed:', description);
    throw new Error(`Facebook Page discovery failed (${description})`);
  }

  const data: any = await res.json();
  const accounts = Array.isArray(data?.data) ? data.data : [];
  return accounts.map((acc: any) => ({
    id: String(acc.id),
    name: acc.name || 'Facebook Page',
    category: acc.category || null,
    pageAccessToken: acc.access_token,
    // Real profile picture only - no fabricated fallback avatars.
    profilePicture: acc?.picture?.data?.url || null,
  }));
}

/**
 * Fetches Page ratings/recommendations (GET /{page-id}/ratings).
 *
 * Throws when the Graph API call fails - an API failure is NEVER converted
 * into an empty review list. A successful call returning zero reviews
 * simply returns [] (EMPTY_SUCCESS upstream).
 */
export async function fetchFacebookPageReviews(
  pageAccessToken: string,
  pageId: string,
  _env?: WorkerEnv
): Promise<FacebookReviewItem[]> {
  const url = `${GRAPH_BASE}/${pageId}/ratings?fields=id,created_time,has_rating,rating,review_text,reviewer{name,id,picture}&access_token=${encodeURIComponent(
    pageAccessToken
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    const description = describeGraphError(res.status, errText);
    console.error('[FacebookOAuth] Review fetch failed:', description);
    throw new Error(`Facebook review fetch failed (${description})`);
  }

  const data: any = await res.json();
  const ratings = Array.isArray(data?.data) ? data.data : [];
  const reviews: FacebookReviewItem[] = [];

  for (const r of ratings) {
    if (!r.review_text || !String(r.review_text).trim()) continue;
    reviews.push({
      id: buildFacebookReviewExternalId(pageId, r),
      // Real reviewer data only - null when Meta does not provide a field.
      authorName: r.reviewer?.name || null,
      authorAvatar: r.reviewer?.picture?.data?.url || null,
      rating: typeof r.rating === 'number' ? r.rating : null,
      text: String(r.review_text),
      date: r.created_time || null,
      source: 'facebook',
      pageId,
      postUrl: `https://facebook.com/${pageId}`,
    });
  }

  return reviews;
}

/**
 * Transforms incoming Meta Graph API Webhook push notifications into
 * standardized review items. Only real payload fields are used.
 */
export function transformFacebookWebhookPayload(payload: any): FacebookReviewItem[] {
  const reviews: FacebookReviewItem[] = [];
  const entries = payload?.entry || [];

  for (const entry of entries) {
    const pageId = entry.id;
    const changes = entry.changes || [];

    for (const change of changes) {
      const field = change.field;
      const value = change.value;

      if (field === 'ratings' || field === 'recommendations') {
        const text = value.review_text || value.message;
        if (text) {
          reviews.push({
            id: value.review_id
              ? `fb_rating_${String(value.review_id)}`
              : buildFacebookReviewExternalId(pageId, { reviewer: { id: value.reviewer_id }, created_time: value.created_time, review_text: text }),
            authorName: value.reviewer_name || null,
            authorAvatar: null,
            rating: typeof value.rating === 'number' ? value.rating : value.recommendation_type === 'positive' ? 5 : null,
            text,
            date: value.created_time ? new Date(value.created_time * 1000).toISOString() : null,
            source: 'facebook',
            pageId,
            postUrl: `https://facebook.com/${pageId}`,
          });
        }
      } else if (field === 'feed' && value.item === 'comment' && value.verb === 'add') {
        if (value.message && value.message.length > 10) {
          reviews.push({
            id: value.comment_id
              ? `fb_rating_${String(value.comment_id)}`
              : buildFacebookReviewExternalId(pageId, { reviewer: { id: value.from?.id }, created_time: value.created_time, review_text: value.message }),
            authorName: value.from?.name || null,
            authorAvatar: null,
            rating: null,
            text: value.message,
            date: value.created_time ? new Date(value.created_time * 1000).toISOString() : null,
            source: 'facebook',
            pageId,
            postUrl: value.post_id ? `https://facebook.com/${value.post_id}` : `https://facebook.com/${pageId}`,
          });
        }
      }
    }
  }

  return reviews;
}

/**
 * Lists the user's Facebook Pages as customer-safe descriptors
 * (pageId + name only - no tokens, no internal document IDs).
 */
export async function listFacebookPages(accessToken: string): Promise<{ pageId: string; name: string }[]> {
  const pages = await getFacebookPages(accessToken);
  return pages.map((p) => ({ pageId: p.id, name: p.name }));
}
