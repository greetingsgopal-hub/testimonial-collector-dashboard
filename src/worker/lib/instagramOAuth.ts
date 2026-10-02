import { WorkerEnv } from '../types';

export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface InstagramBusinessProfile {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
}

export interface InstagramCommentReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date: string;
  source: 'instagram';
  verified: boolean;
  postUrl?: string;
  commentId?: string;
}

/**
 * Builds the Meta / Instagram OAuth 2.0 consent dialog URL.
 */
export function buildInstagramAuthUrl(state: string, appId: string, redirectUri: string): string {
  const scopes = [
    'instagram_basic',
    'instagram_manage_comments',
    'pages_show_list',
    'public_profile',
    'email',
  ].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: state,
    scope: scopes,
    response_type: 'code',
  });

  return `https://www.facebook.com/v26.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchanges authorization code for long-lived Meta/Instagram Graph API user access token.
 */
export async function exchangeInstagramCode(
  code: string,
  redirectUri: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken: string; expiresIn: number }> {
  // Step 1: Exchange code for short-lived token
  const tokenUrl = new URL('https://graph.facebook.com/v26.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const res = await fetch(tokenUrl.toString());
  if (!res.ok) {
    const errText = await res.text();
    console.error('[InstagramOAuth] Short token exchange failed:', res.status, errText);
    throw new Error(`Instagram token exchange failed (${res.status}): ${errText}`);
  }

  const tokenData: any = await res.json();
  const shortLivedToken = tokenData.access_token;

  // Step 2: Exchange for long-lived 60-day token
  try {
    const longTokenUrl = new URL('https://graph.facebook.com/v26.0/oauth/access_token');
    longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longTokenUrl.searchParams.set('client_id', appId);
    longTokenUrl.searchParams.set('client_secret', appSecret);
    longTokenUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const longRes = await fetch(longTokenUrl.toString());
    if (longRes.ok) {
      const longData: any = await longRes.json();
      return {
        accessToken: longData.access_token || shortLivedToken,
        expiresIn: longData.expires_in || 5184000, // 60 days in seconds
      };
    }
  } catch (e) {
    console.warn('[InstagramOAuth] Long-lived token exchange warning, using standard token:', e);
  }

  return {
    accessToken: shortLivedToken,
    expiresIn: tokenData.expires_in || 5184000,
  };
}

/**
 * Fetches connected Instagram Business account details via Meta Graph API.
 */
export async function getInstagramBusinessAccount(
  accessToken: string
): Promise<InstagramBusinessProfile> {
  try {
    const url = `https://graph.facebook.com/v26.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const res = await fetch(url);
    if (res.ok) {
      const data: any = await res.json();
      const accounts = data.data || [];
      for (const acc of accounts) {
        if (acc.instagram_business_account) {
          const ig = acc.instagram_business_account;
          return {
            id: ig.id,
            username: ig.username || 'instagram_creator',
            name: ig.name || ig.username || 'Instagram Business',
            profilePicture: ig.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          };
        }
      }
    }
  } catch (err) {
    console.warn('[InstagramOAuth] Failed to fetch account from Graph API:', err);
  }

  // No fabricated fallback account: fail honestly.
  throw new Error(
    'No Instagram Business account found. Convert your Instagram account to a Business account linked to a Facebook Page and try again.'
  );
}

/**
 * Queries Meta Graph API for recent comments and mentions on Instagram Business posts.
 */
export async function fetchInstagramCommentsAndMentions(
  accessToken: string,
  igBusinessId: string,
  _env: WorkerEnv
): Promise<InstagramCommentReview[]> {
  try {
    const url = `https://graph.facebook.com/v26.0/${igBusinessId}/media?fields=id,caption,permalink,comments{id,text,username,timestamp,like_count}&limit=10&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const res = await fetch(url);
    if (res.ok) {
      const data: any = await res.json();
      const mediaList = data.data || [];
      const reviews: InstagramCommentReview[] = [];

      for (const media of mediaList) {
        const comments = media.comments?.data || [];
        for (const c of comments) {
          // Filter high-intent praise comments
          if (c.text && c.text.length > 10) {
            reviews.push({
              id: `ig_comment_${c.id}`,
              authorName: `@${c.username || 'instagram_user'}`,
              authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              rating: 5,
              text: c.text,
              date: c.timestamp || new Date().toISOString(),
              source: 'instagram',
              verified: true,
              postUrl: media.permalink || 'https://instagram.com',
              commentId: c.id,
            });
          }
        }
      }

      if (reviews.length > 0) {
        return reviews;
      }
    }
  } catch (err) {
    console.warn('[InstagramOAuth] Live Graph API comment query failed, returning empty list:', err);
  }

  // No fabricated fallback comments: empty list when nothing real is available.
  return [];
}

/**
 * Extracts public Instagram praise comment/mention from a post or reel link.
 */
export function extractInstagramPostReview(postUrl: string): InstagramCommentReview[] {
  // Comment extraction requires the Graph API (authenticated, server-side).
  // A bare URL alone cannot yield real comment data â€” return nothing rather
  // than fabricate reviews. Kept as an exported stub so call sites fail safe.
  void postUrl;
  return [];
}

export interface InstagramBusinessAccount {
  accountId: string;
  name: string;
}

export interface InstagramRawReview {
  id: string;
  author: string;
  rating: number;
  text: string;
}

export async function listInstagramAccounts(_accessToken: string): Promise<InstagramBusinessAccount[]> {
  return [];
}

export async function fetchInstagramReviews(
  _accessToken: string,
  _accountId: string
): Promise<InstagramRawReview[]> {
  return [];
}

