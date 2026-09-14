/**
 * Helper to verify Firebase ID tokens using the Google Identity Toolkit REST API.
 * This runs in Node serverless functions to authenticate callers before performing
 * sensitive operations (social publishing, token decryption, account management).
 */

function getFirebaseApiKey(): string {
  const key = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!key) {
    throw new Error('[Security] Firebase Web API Key is missing. Set VITE_FIREBASE_API_KEY or FIREBASE_API_KEY in Netlify environment variables.');
  }
  return key;
}

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
}

export async function verifyFirebaseToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  try {
    const apiKey = getFirebaseApiKey();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      console.warn('[FirebaseAuth] Token verification failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.users && Array.isArray(data.users) && data.users.length > 0) {
      const user = data.users[0];
      return {
        uid: user.localId,
        email: user.email,
      };
    }
    return null;
  } catch (err) {
    console.error('[FirebaseAuth] Error verifying token:', err);
    return null;
  }
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}
