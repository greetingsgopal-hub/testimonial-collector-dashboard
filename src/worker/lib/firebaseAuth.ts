import { WorkerEnv } from '../types';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
}

function getFirebaseApiKey(env: WorkerEnv): string {
  const key = env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY;
  if (!key) {
    throw new Error('[Security] Firebase Web API Key is missing. Set FIREBASE_API_KEY in Worker environment.');
  }
  return key;
}

export async function verifyFirebaseToken(idToken: string, env: WorkerEnv): Promise<VerifiedFirebaseUser | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  try {
    const apiKey = getFirebaseApiKey(env);
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

    const data: any = await response.json();
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

export function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}
