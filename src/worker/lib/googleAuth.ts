import crypto from 'node:crypto';
import { WorkerEnv } from '../types';

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function parseCredentials(env: WorkerEnv): ServiceAccountCredentials | null {
  const rawKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (rawKey && rawKey.trim()) {
    try {
      let jsonStr = rawKey.trim();
      // Support base64 encoded JSON if provided
      if (jsonStr.startsWith('ey') || (!jsonStr.startsWith('{') && !jsonStr.includes('\n'))) {
        try {
          const decoded = Buffer.from(jsonStr, 'base64').toString('utf8');
          if (decoded.includes('client_email')) {
            jsonStr = decoded;
          }
        } catch {
          // not base64, continue
        }
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key.replace(/\\n/g, '\n'),
          project_id: parsed.project_id,
        };
      }
    } catch (e) {
      console.error('[GoogleAuth] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', (e as Error).message);
    }
  }

  // Fallback to separate env variables if configured
  if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return {
      client_email: env.FIREBASE_CLIENT_EMAIL.trim(),
      private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim(),
      project_id: env.FIREBASE_PROJECT_ID,
    };
  }

  return null;
}

function base64UrlEncode(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buf.toString('base64url');
}

/**
 * Retrieves a privileged Google OAuth 2.0 access token for Firestore REST operations.
 * Uses the minimum required scope: https://www.googleapis.com/auth/datastore
 */
export async function getServiceAccountAccessToken(env: WorkerEnv): Promise<string | null> {
  const nowSec = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 60-second buffer)
  if (cachedToken && cachedToken.expiresAt > nowSec + 60) {
    return cachedToken.accessToken;
  }

  const creds = parseCredentials(env);
  if (!creds) {
    return null;
  }

  try {
    const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    const claimSet = JSON.stringify({
      iss: creds.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: nowSec + 3600,
      iat: nowSec,
    });

    const encodedHeader = base64UrlEncode(header);
    const encodedClaimSet = base64UrlEncode(claimSet);
    const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(unsignedToken);
    sign.end();
    const signature = sign.sign(creds.private_key);
    const encodedSignature = base64UrlEncode(signature);

    const signedJwt = `${unsignedToken}.${encodedSignature}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[GoogleAuth] Token exchange failed:', tokenRes.status, errText);
      return null;
    }

    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('[GoogleAuth] No access_token returned by oauth2 endpoint');
      return null;
    }

    cachedToken = {
      accessToken: tokenData.access_token,
      expiresAt: nowSec + (tokenData.expires_in || 3600),
    };

    return cachedToken.accessToken;
  } catch (err: any) {
    console.error('[GoogleAuth] Failed to generate service account token:', err?.message || err);
    return null;
  }
}
