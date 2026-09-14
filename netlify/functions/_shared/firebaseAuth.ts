/**
 * Helper to verify Firebase ID tokens using the Google Identity Toolkit REST API.
 * This runs in Node without requiring full Firebase Admin SDK service account setup.
 */

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
}

export async function verifyFirebaseToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  if (!idToken) return null;

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
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
    if (data.users && data.users.length > 0) {
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
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}
