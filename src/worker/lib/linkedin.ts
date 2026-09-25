import { Buffer } from 'node:buffer';

const CANDIDATE_VERSIONS = [
  '202502',
  '202501',
  '202412',
  '202411',
  '202410',
  '202409',
  '202408',
  '202407',
  '202406',
  '202405',
  '202404',
  '202403',
  '202402',
  '202609',
  '202608',
  '202607',
  '202606',
  '202605',
  '202604',
  '202603',
  '202602',
  '202601',
];

let cachedActiveVersion: string | null = null;

async function executeWithVersionRetry(
  requestFn: (version: string) => Promise<Response>
): Promise<Response> {
  if (cachedActiveVersion) {
    const res = await requestFn(cachedActiveVersion);
    if (res.status !== 426) {
      return res;
    }
    cachedActiveVersion = null;
  }

  let lastRes: Response | null = null;
  for (const v of CANDIDATE_VERSIONS) {
    const res = await requestFn(v);
    if (res.status !== 426) {
      cachedActiveVersion = v;
      return res;
    }
    lastRes = res;
  }

  return lastRes!;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

export interface LinkedInProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

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

  return res.json() as Promise<LinkedInTokenResponse>;
}

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

  return res.json() as Promise<LinkedInProfile>;
}

export async function publishLinkedInImagePost(
  accessToken: string,
  personUrn: string,
  commentary: string,
  imageBase64: string
): Promise<{ postId: string; postUrl: string }> {
  // Step 1: Initialize Image Upload
  const initRes = await executeWithVersionRetry((version) =>
    fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': version,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: personUrn,
        },
      }),
    })
  );

  if (!initRes.ok) {
    const errBody = await initRes.text();
    console.error('[LinkedIn] Image initializeUpload failed:', initRes.status, errBody);
    throw new Error(`LinkedIn image upload init failed (${initRes.status}): ${errBody}`);
  }

  const initData: any = await initRes.json();
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

  const postRes = await executeWithVersionRetry((version) =>
    fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': version,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    })
  );

  if (!postRes.ok) {
    const errBody = await postRes.text();
    console.error('[LinkedIn] Create post failed:', postRes.status, errBody);
    throw new Error(`LinkedIn post creation failed (${postRes.status}): ${errBody}`);
  }

  const postId = postRes.headers.get('x-restli-id') || imageUrn;
  const postUrl = `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/`;

  return { postId, postUrl };
}

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

  const postRes = await executeWithVersionRetry((version) =>
    fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': version,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    })
  );

  if (!postRes.ok) {
    const errBody = await postRes.text();
    console.error('[LinkedIn] Text post creation failed:', postRes.status, errBody);
    throw new Error(`LinkedIn post creation failed (${postRes.status}): ${errBody}`);
  }

  const postId = postRes.headers.get('x-restli-id') || `urn:li:post:${Date.now()}`;
  const postUrl = `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/`;

  return { postId, postUrl };
}
