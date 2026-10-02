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

export interface GoogleResolvedPlace {
  placeId: string;
  name: string;
  address?: string;
  googleMapsUri?: string;
  rating?: number;
  totalReviews?: number;
  reviews: ImportedReview[];
}

export interface GoogleBusinessLocation {
  id: string;
  name: string;
  address?: string;
  accountName: string;
  storeCode?: string;
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
 * Refreshes a Google access token using a stored refresh token.
 * Returns { access_token, expires_in } on success; throws on failure.
 */
export async function refreshGoogleAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in?: number }> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[GoogleOAuth] Token refresh failed:', res.status, errorText);
    throw new Error(`Google token refresh error (${res.status}): ${errorText}`);
  }

  return (await res.json()) as { access_token: string; expires_in?: number };
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
 * Server-side resolution of Google Maps links (including short links like maps.app.goo.gl, goo.gl/maps).
 * Follows HTTP redirects to capture destination URL and extracts business name or place clues.
 */
export async function resolveGoogleMapsUrl(input: string): Promise<{
  originalInput: string;
  finalUrl: string;
  placeId?: string;
  extractedQuery?: string;
}> {
  const trimmed = input.trim();
  let candidate = trimmed;

  // 1. If it's a URL or domain, follow redirects
  if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.includes('goo.gl') || candidate.includes('google.com')) {
    if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
      candidate = `https://${candidate}`;
    }

    let finalUrl = candidate;
    try {
      const redirectRes = await fetch(candidate, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      finalUrl = redirectRes.url || candidate;
    } catch (e) {
      console.warn('[GoogleOAuth] Redirect resolution failed, using original URL:', e);
    }

    // 2. Parse place identifiers from final URL
    // ChIJ standard Place ID
    const chijMatch = finalUrl.match(/\b(ChIJ[a-zA-Z0-9_-]{20,})\b/);
    if (chijMatch) {
      return { originalInput: trimmed, finalUrl, placeId: chijMatch[1] };
    }

    // place_id parameter
    if (finalUrl.includes('place_id=')) {
      const pMatch = finalUrl.match(/place_id=([^&]+)/);
      if (pMatch && pMatch[1]) {
        return { originalInput: trimmed, finalUrl, placeId: decodeURIComponent(pMatch[1]) };
      }
    }

    // /maps/place/<Business+Name>/...
    const placePathMatch = finalUrl.match(/\/maps\/place\/([^\/@?]+)/);
    if (placePathMatch && placePathMatch[1]) {
      const query = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' '));
      return { originalInput: trimmed, finalUrl, extractedQuery: query };
    }

    // q= or query=
    const qMatch = finalUrl.match(/[?&](?:q|query)=([^&]+)/);
    if (qMatch && qMatch[1]) {
      const query = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
      return { originalInput: trimmed, finalUrl, extractedQuery: query };
    }

    return { originalInput: trimmed, finalUrl };
  }

  // Not a URL: check if it's a direct ChIJ place ID or places/ resource
  const directChij = trimmed.match(/\b(ChIJ[a-zA-Z0-9_-]+)\b/) || (trimmed.startsWith('places/') ? [trimmed, trimmed.replace(/^places\//, '')] : null);
  if (directChij) {
    return { originalInput: trimmed, finalUrl: trimmed, placeId: directChij[1] };
  }

  // Treat as business name search query
  return { originalInput: trimmed, finalUrl: trimmed, extractedQuery: trimmed };
}

/**
 * Fetches Google Place details & customer reviews using official Google Places API (New).
 * Does not scrape HTML. Uses official places.googleapis.com endpoints.
 */
export async function fetchGooglePlaceDetailsNew(
  input: string,
  env: WorkerEnv
): Promise<GoogleResolvedPlace> {
  // GOOGLE_PLACES_API_KEY only — the Firebase web API key is NOT a Places
  // credential; falling back to it masks a missing/invalid Places key with
  // a misleading Google 403 instead of a clear configuration error.
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key (GOOGLE_PLACES_API_KEY) is not configured in the system environment.');
  }

  // 1. Resolve URL to Place ID or search query
  const resolution = await resolveGoogleMapsUrl(input);

  let placeId = resolution.placeId;

  // 2. If we only have an extracted query or business name, use Places API (New) Text Search
  if (!placeId && resolution.extractedQuery) {
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchRes = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews',
      },
      body: JSON.stringify({ textQuery: resolution.extractedQuery }),
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      let errJson: any;
      try { errJson = JSON.parse(errText); } catch {}
      const reason = errJson?.error?.details?.[0]?.reason || errJson?.error?.status || `HTTP_${searchRes.status}`;
      const msg = errJson?.error?.message || errText;

      if (reason === 'SERVICE_DISABLED' || reason === 'API_KEY_SERVICE_BLOCKED' || msg.includes('has not been used') || msg.includes('blocked')) {
        throw new Error('Google Places API (New) is not enabled on this Google Cloud project or restricted on this API key. Please verify Google Cloud project configuration.');
      }
      throw new Error(`Google Places search error: ${msg}`);
    }

    const searchData: any = await searchRes.json();
    const candidate = searchData.places?.[0];
    if (!candidate) {
      throw new Error('Could not find a Google business matching the provided link or name.');
    }

    return mapPlacesNewResult(candidate);
  }

  // 3. We have a direct Place ID (or extracted ChIJ ID) -> Call Place Details (New)
  if (!placeId) {
    throw new Error('Could not resolve this Google Maps link. Please verify the URL or search by business name.');
  }

  // Ensure placeId format for Places API (New): accepts 'places/ChIJ...' or 'ChIJ...'
  const cleanPlaceId = placeId.startsWith('places/') ? placeId.replace('places/', '') : placeId;
  const detailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(cleanPlaceId)}`;

  const detailsRes = await fetch(detailsUrl, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews',
    },
  });

  if (!detailsRes.ok) {
    const errText = await detailsRes.text();
    let errJson: any;
    try { errJson = JSON.parse(errText); } catch {}
    const reason = errJson?.error?.details?.[0]?.reason || errJson?.error?.status || `HTTP_${detailsRes.status}`;
    const msg = errJson?.error?.message || errText;

    if (reason === 'SERVICE_DISABLED' || reason === 'API_KEY_SERVICE_BLOCKED' || msg.includes('has not been used') || msg.includes('blocked')) {
      throw new Error('Google Places API (New) is not enabled on this Google Cloud project or restricted on this API key.');
    }
    throw new Error(`Google Place details error: ${msg}`);
  }

  const placeData: any = await detailsRes.json();
  return mapPlacesNewResult(placeData);
}

function mapPlacesNewResult(item: any): GoogleResolvedPlace {
  const data = item?.result || item || {};
  const rawReviews = Array.isArray(data.reviews) ? data.reviews : [];

  const reviews: ImportedReview[] = rawReviews.map((r: any, idx: number) => {
    const authorName = r.authorAttribution?.displayName || r.author_name || 'Google Reviewer';
    const authorAvatar = r.authorAttribution?.photoUri || r.profile_photo_url;
    const rating = typeof r.rating === 'number' ? r.rating : 5;
    const text = r.text?.text || (typeof r.text === 'string' ? r.text : r.originalText?.text || '');
    const date = r.publishTime || (r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString());
    const platformUrl = r.authorAttribution?.uri || data.googleMapsUri || data.url || 'https://maps.google.com';

    return {
      id: r.name || `google_place_${Date.now()}_${idx}`,
      authorName,
      authorAvatar,
      rating,
      text,
      date,
      source: 'google',
      verified: true,
      platformUrl,
    };
  });

  return {
    placeId: data.id || data.place_id || '',
    name: data.displayName?.text || data.name || 'Google Business Location',
    address: data.formattedAddress || data.formatted_address || '',
    googleMapsUri: data.googleMapsUri || data.url || 'https://maps.google.com',
    rating: data.rating || 0,
    totalReviews: data.userRatingCount || data.user_ratings_total || reviews.length,
    reviews,
  };
}

/**
 * Discovers Google Business Profile accounts and locations using official Google Business Profile APIs.
 */
export async function listGoogleBusinessAccountsAndLocations(accessToken: string): Promise<GoogleBusinessLocation[]> {
  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!accountsRes.ok) {
    const errText = await accountsRes.text();
    console.warn('[GoogleOAuth] listAccounts failed:', accountsRes.status, errText);
    let parsed: any;
    try { parsed = JSON.parse(errText); } catch {}
    const msg = parsed?.error?.message || errText;
    throw new Error(`Google Business Profile API error (${accountsRes.status}): ${msg}`);
  }

  const accountsData: any = await accountsRes.json();
  const accounts = accountsData.accounts || [];
  if (accounts.length === 0) {
    return [];
  }

  const locations: GoogleBusinessLocation[] = [];

  for (const account of accounts) {
    const accountName = account.name; // e.g. "accounts/123456789"
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode,storefrontAddress`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (locRes.ok) {
      const locData: any = await locRes.json();
      const locList = locData.locations || [];
      for (const loc of locList) {
        let addr = '';
        if (loc.storefrontAddress?.addressLines) {
          addr = loc.storefrontAddress.addressLines.join(', ');
          if (loc.storefrontAddress.locality) addr += `, ${loc.storefrontAddress.locality}`;
        }
        locations.push({
          id: loc.name, // e.g. "locations/987654321"
          name: loc.title || loc.name,
          address: addr || undefined,
          accountName,
          storeCode: loc.storeCode,
        });
      }
    } else {
      console.warn('[GoogleOAuth] listLocations failed for account:', accountName, locRes.status);
    }
  }

  return locations;
}

/**
 * Fetches reviews for a specific Google Business Profile location.
 */
export async function fetchGoogleBusinessLocationReviews(
  accessToken: string,
  accountName: string,
  locationName: string
): Promise<ImportedReview[]> {
  const cleanAccount = accountName.startsWith('accounts/') ? accountName : `accounts/${accountName}`;
  const cleanLocation = locationName.startsWith('locations/') ? locationName : `locations/${locationName}`;

  const url = `https://mybusiness.googleapis.com/v4/${cleanAccount}/${cleanLocation}/reviews`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn('[GoogleOAuth] fetchLocationReviews failed:', res.status, errText);
    let parsed: any;
    try { parsed = JSON.parse(errText); } catch {}
    const msg = parsed?.error?.message || errText;
    throw new Error(`Failed to retrieve reviews from Google Business Profile (${res.status}): ${msg}`);
  }

  const data: any = await res.json();
  const rawReviews = data.reviews || [];
  const ratingMap: Record<string, number> = { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 };

  return rawReviews.map((rev: any, idx: number) => ({
    id: rev.reviewId || `google_bp_${Date.now()}_${idx}`,
    authorName: rev.reviewer?.displayName || 'Google Reviewer',
    authorAvatar: rev.reviewer?.profilePhotoUrl,
    rating: ratingMap[rev.starRating] || (typeof rev.starRating === 'number' ? rev.starRating : 5),
    text: rev.comment || '',
    date: rev.createTime || new Date().toISOString(),
    source: 'google',
    verified: true,
    platformUrl: 'https://maps.google.com',
  }));
}

/**
 * Backward compatibility wrapper for fetchGoogleBusinessReviews.
 */
export async function fetchGoogleBusinessReviews(
  accessToken: string,
  _envOrPlaceId?: any
): Promise<ImportedReview[]> {
  try {
    const locations = await listGoogleBusinessAccountsAndLocations(accessToken);
    if (locations.length === 0) return [];
    const first = locations[0];
    return await fetchGoogleBusinessLocationReviews(accessToken, first.accountName, first.id);
  } catch (err) {
    console.warn('[GoogleOAuth] fetchGoogleBusinessReviews failed:', err);
    return [];
  }
}

/**
 * Backward compatibility wrapper for fetchGooglePlaceReviews.
 */
export async function fetchGooglePlaceReviews(
  placeIdOrQuery: string,
  env: WorkerEnv
): Promise<{ placeName: string; rating: number; totalReviews: number; reviews: ImportedReview[] }> {
  const result = await fetchGooglePlaceDetailsNew(placeIdOrQuery, env);
  return {
    placeName: result.name,
    rating: result.rating || 0,
    totalReviews: result.totalReviews || result.reviews.length,
    reviews: result.reviews,
  };
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
    const locations = await listGoogleBusinessAccountsAndLocations(accessToken);
    return locations.map((loc) => ({
      placeId: loc.id,
      name: loc.name,
    }));
  } catch (_err) {
    return [];
  }
}
