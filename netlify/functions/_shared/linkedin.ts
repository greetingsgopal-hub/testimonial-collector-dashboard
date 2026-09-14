/**
 * LinkedIn Posts API & OAuth implementation.
 * Follows current official LinkedIn Developer standards (2024-2026).
 * Uses Posts API (/rest/posts) and Images API (/rest/images).
 */

const LINKEDIN_API_VERSION = '202401';

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

export interface LinkedInProfile {
  sub: string; // Member Person ID
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

/**
 * Exchange OAuth authorization code for LinkedIn access token.
 */
export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<LinkedInTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[LinkedIn] Token exchange failed:', res.status, errorBody);
    throw new Error(`LinkedIn OAuth failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

/**
 * Fetch authenticated LinkedIn member profile info via OpenID userinfo endpoint.
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[LinkedIn] Failed to fetch member profile:', res.status, errText);
    throw new Error(`Failed to retrieve LinkedIn member info: ${res.status}`);
  }

  return res.json();
}

/**
 * Publish an organic image post to LinkedIn via the official Posts API.
 */
export async function publishLinkedInImagePost(
  accessToken: string,
  personUrn: string,
  commentary: string,
  imageBase64: string
): Promise<{ postId: string; postUrl: string }> {
  // Step 1: Initialize Image Upload
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': LINKEDIN_API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: personUrn,
      },
    }),
  });

  if (!initRes.ok) {
    const errBody = await initRes.text();
    console.error('[LinkedIn] Image initializeUpload failed:', initRes.status, errBody);
    throw new Error(`LinkedIn image upload init failed (${initRes.status}): ${errBody}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData.value?.uploadUrl;
  const imageUrn = initData.value?.image;

  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn did not return valid image upload credentials.');
  }

  // Step 2: Upload image binary
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(cleanBase64, 'base64');

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'image/png',
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    console.error('[LinkedIn] Image binary upload failed:', uploadRes.status, errBody);
    throw new Error(`LinkedIn image binary upload failed: ${uploadRes.status}`);
  }

  // Step 3: Create Post with Image URN
  const postPayload = {
    author: personUrn,
    commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      media: {
        title: 'Customer Testimonial',
        id: imageUrn,
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': LINKEDIN_API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postPayload),
  });

  if (!postRes.ok) {
    const errBody = await postRes.text();
    console.error('[LinkedIn] Create post failed:', postRes.status, errBody);
    throw new Error(`LinkedIn post creation failed (${postRes.status}): ${errBody}`);
  }

  // LinkedIn returns post URN in x-restli-id header (e.g. urn:li:share:12345678)
  const postId = postRes.headers.get('x-restli-id') || imageUrn;
  const postUrl = `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/`;

  return { postId, postUrl };
}

/**
 * Publish a text-only post to LinkedIn.
 */
export async function publishLinkedInTextPost(
  accessToken: string,
  personUrn: string,
  commentary: string
): Promise<{ postId: string; postUrl: string }> {
  const postPayload = {
    author: personUrn,
    commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': LINKEDIN_API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postPayload),
  });

  if (!postRes.ok) {
    const errBody = await postRes.text();
    console.error('[LinkedIn] Text post creation failed:', postRes.status, errBody);
    throw new Error(`LinkedIn post creation failed (${postRes.status}): ${errBody}`);
  }

  const postId = postRes.headers.get('x-restli-id') || `urn:li:post:${Date.now()}`;
  const postUrl = `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/`;

  return { postId, postUrl };
}
