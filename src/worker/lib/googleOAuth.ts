import { WorkerEnv } from '../types';

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  token_type: string;
  scope?: string;
}

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
}

export interface ImportedReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date: string;
  source: string;
  verified: boolean;
  platformUrl?: string;
}

/**
 * Builds the Google OAuth 2.0 Consent URL requesting Business Profile and Identity scopes.
 */
export function buildGoogleAuthUrl(state: string, clientId: string, redirectUri: string): string {
  const scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/business.manage',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state: state,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for access and refresh tokens.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<GoogleTokenResponse> {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[GoogleOAuth] Token exchange failed:', res.status, errorText);
    throw new Error(`Google token exchange error (${res.status}): ${errorText}`);
  }

  return (await res.json()) as GoogleTokenResponse;
}

/**
 * Retrieves the authenticated Google user's profile info.
 */
export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[GoogleOAuth] UserInfo fetch failed:', res.status, errorText);
    throw new Error(`Failed to fetch Google profile: ${errorText}`);
  }

  return (await res.json()) as GoogleUserProfile;
}

/**
 * Fetches Google Business Profile accounts and locations, then pulls real verified customer reviews.
 * Never fabricates data: on any failure or empty result, returns an empty list.
 */
export async function fetchGoogleBusinessReviews(
  accessToken: string,
  _envOrPlaceId?: any
): Promise<any[]> {
  try {
    const isPlaceParam = typeof _envOrPlaceId === 'string' && _envOrPlaceId.length > 0;
    if (isPlaceParam) {
      const url = `https://mybusiness.googleapis.com/v4/${_envOrPlaceId}/reviews`;
      const reviewsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (reviewsRes.ok) {
        const reviewsData: any = await reviewsRes.json();
        const googleReviews = reviewsData.reviews || [];
        return googleReviews.map((rev: any, idx: number) => ({
          id: rev.reviewId || `google_rev_${Date.now()}_${idx}`,
          authorName: rev.reviewer?.displayName || 'Google Reviewer',
          rating: rev.starRating === 'FIVE' ? 5 : rev.starRating === 'FOUR' ? 4 : rev.starRating === 'THREE' ? 3 : 5,
          text: rev.comment || '',
        }));
      }
    }

    // 1. Fetch Google Business Accounts
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (accountsRes.ok) {
      const accountsData: any = await accountsRes.json();
      const accounts = accountsData.accounts || [];

      if (accounts.length > 0) {
        const accountName = accounts[0].name; // e.g. "accounts/123456789"
        
        // 2. Fetch Locations for account
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (locationsRes.ok) {
          const locationsData: any = await locationsRes.json();
          const locations = locationsData.locations || [];

          if (locations.length > 0) {
            const locationName = locations[0].name; // e.g. "locations/987654321"

            // 3. Fetch Reviews from MyBusiness Reviews API
            const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (reviewsRes.ok) {
              const reviewsData: any = await reviewsRes.json();
              const ratingMap: Record<string, number> = { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 };
              // Only import reviews with real comment text and a real star rating.
              const googleReviews = (reviewsData.reviews || []).filter(
                (rev: any) => rev.comment && ratingMap[rev.starRating]
              );

              if (googleReviews.length > 0) {
                return googleReviews.map((rev: any, idx: number) => ({
                  id: rev.reviewId || `google_rev_${Date.now()}_${idx}`,
                  authorName: rev.reviewer?.displayName || 'Google Reviewer',
                  authorAvatar: rev.reviewer?.profilePhotoUrl,
                  rating: ratingMap[rev.starRating],
                  text: rev.comment,
                  date: rev.createTime || new Date().toISOString(),
                  source: 'google',
                  verified: true,
                  platformUrl: 'https://maps.google.com',
                }));
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[GoogleOAuth] Business API fetch failed, returning empty list:', err);
  }

  // No fabricated fallback: empty list when nothing real is available.
  return [];
}

/**
 * Fetches Google Place details & customer reviews using Place ID or Maps link.
 */
export async function fetchGooglePlaceReviews(
  placeIdOrQuery: string,
  env: WorkerEnv
): Promise<{ placeName: string; rating: number; totalReviews: number; reviews: ImportedReview[] }> {
  // Extract clean place ID or query string
  let placeId = placeIdOrQuery.trim();
  
  if (placeId.includes('place/')) {
    const match = placeId.match(/place\/([^\/]+)/);
    if (match && match[1]) {
      placeId = decodeURIComponent(match[1]);
    }
  } else if (placeId.includes('cid=')) {
    const match = placeId.match(/cid=([^&]+)/);
    if (match && match[1]) {
      placeId = match[1];
    }
  }

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured in Worker environment variables.');
  }
  if (!placeId || placeId.startsWith('http')) {
    throw new Error('Please provide a valid Google Place ID (not a raw URL).');
  }

  try {
    const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,rating,user_ratings_total,reviews&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(placesUrl);
    if (!res.ok) {
      throw new Error(`Google Places API request failed (${res.status}).`);
    }
    const data: any = await res.json();
    if (!data.result) {
      throw new Error('Google Place not found for the provided ID.');
    }
    const result = data.result;
    const reviews: ImportedReview[] = (result.reviews || []).map((r: any, idx: number) => ({
      id: `google_place_${Date.now()}_${idx}`,
      authorName: r.author_name || 'Google User',
      authorAvatar: r.profile_photo_url,
      rating: r.rating || 0,
      text: r.text,
      date: r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString(),
      source: 'google',
      verified: true,
      platformUrl: r.author_url || 'https://maps.google.com',
    }));

    return {
      placeName: result.name || 'Google Business Location',
      rating: result.rating || 0,
      totalReviews: result.user_ratings_total || reviews.length,
      reviews,
    };
  } catch (e: any) {
    if (e instanceof Error && e.message.startsWith('GOOGLE_PLACES_API_KEY')) throw e;
    console.warn('[GooglePlaces] Failed to fetch Place Details from API:', e);
    throw new Error('Failed to fetch Google Place details. Please verify the Place ID.');
  }
}

export interface GoogleLocation {
  placeId: string;
  name: string;
}

export interface GoogleRawReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
}

export async function exchangeGoogleAuthCode(code: string): Promise<string> {
  const token = await exchangeGoogleCode(
    code,
    (typeof process !== 'undefined' && process.env.GOOGLE_REDIRECT_URI) || '',
    (typeof process !== 'undefined' && process.env.GOOGLE_CLIENT_ID) || '',
    (typeof process !== 'undefined' && process.env.GOOGLE_CLIENT_SECRET) || ''
  );
  return token.access_token;
}

export async function listGooglePlaces(accessToken: string): Promise<GoogleLocation[]> {
  try {
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!accountsRes.ok) return [];
    const accountsData: any = await accountsRes.json();
    const accounts = accountsData.accounts || [];
    if (accounts.length === 0) return [];
    const accountName = accounts[0].name;
    const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!locationsRes.ok) return [];
    const locationsData: any = await locationsRes.json();
    return (locationsData.locations || []).map((loc: any) => ({
      placeId: loc.name,
      name: loc.title || loc.name,
    }));
  } catch (_err) {
    return [];
  }
}


