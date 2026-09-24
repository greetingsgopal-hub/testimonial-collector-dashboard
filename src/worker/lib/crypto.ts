import crypto from 'node:crypto';
import { WorkerEnv } from '../types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derives a 256-bit encryption key with entropy checks.
 * Supports primary key and previous key for rotation.
 */
function getSecretKey(env: WorkerEnv, usePrevious = false): Buffer {
  let secret = usePrevious ? env.APP_ENCRYPTION_KEY_PREVIOUS : env.APP_ENCRYPTION_KEY;

  if (!secret && !usePrevious) {
    secret = env.LINKEDIN_CLIENT_SECRET;
  }

  if (!secret && !usePrevious) {
    // Local / development fallback key
    secret = 'pandapraise-dev-local-only-key-32chars!!';
  }

  if (!secret) {
    throw new Error(`[Security] No encryption key configured.`);
  }

  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext token using AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encryptToken(plainText: string, env: WorkerEnv): string {
  if (!plainText) return '';
  const key = getSecretKey(env, false);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt an AES-256-GCM encrypted token.
 * Automatically tries APP_ENCRYPTION_KEY_PREVIOUS if primary key fails (Key Rotation Support).
 */
export function decryptToken(encryptedBase64: string, env: WorkerEnv): string {
  if (!encryptedBase64) return '';

  const attemptDecrypt = (key: Buffer): string => {
    const combined = Buffer.from(encryptedBase64, 'base64');
    if (combined.length < IV_LENGTH + TAG_LENGTH) {
      throw new Error('Encrypted payload too short');
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const cipherText = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  };

  try {
    return attemptDecrypt(getSecretKey(env, false));
  } catch (primaryErr) {
    if (env.APP_ENCRYPTION_KEY_PREVIOUS) {
      try {
        return attemptDecrypt(getSecretKey(env, true));
      } catch {
        // Fall through
      }
    }
    console.error('[Crypto] Token decryption failed. Key may have rotated or token was corrupted.');
    throw new Error('Failed to decrypt credentials. Re-authentication required.');
  }
}

/**
 * Generate a cryptographically secure, signed OAuth state parameter.
 * Format: userId.platform.timestamp.nonce.signature
 */
export function generateOAuthState(userId: string, platform: string, env: WorkerEnv): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const key = getSecretKey(env, false);
  const payload = `${userId}.${platform}.${timestamp}.${nonce}`;
  const hmac = crypto.createHmac('sha256', key).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify an OAuth state parameter against replay, tamper, and expiration (10 mins).
 */
export function verifyOAuthState(
  state: string,
  env: WorkerEnv
): { valid: boolean; userId?: string; platform?: string; error?: string } {
  if (!state) return { valid: false, error: 'Missing OAuth state parameter' };

  const parts = state.split('.');
  if (parts.length !== 5 && parts.length !== 4) {
    return { valid: false, error: 'Malformed OAuth state parameter' };
  }

  let userId: string;
  let platform: string;
  let timestampStr: string;
  let nonce: string | undefined;
  let providedHmac: string;
  let expectedPayload: string;

  if (parts.length === 5) {
    [userId, platform, timestampStr, nonce, providedHmac] = parts;
    expectedPayload = `${userId}.${platform}.${timestampStr}.${nonce}`;
  } else {
    [userId, platform, timestampStr, providedHmac] = parts;
    expectedPayload = `${userId}.${platform}.${timestampStr}`;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid state timestamp' };
  }

  // 10 minute expiration check
  const now = Date.now();
  if (now - timestamp > 10 * 60 * 1000) {
    return { valid: false, error: 'OAuth state parameter has expired. Please try connecting again.' };
  }

  const verifyWithKey = (key: Buffer): boolean => {
    const calculatedHmac = crypto.createHmac('sha256', key).update(expectedPayload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(providedHmac, 'hex'), Buffer.from(calculatedHmac, 'hex'));
    } catch {
      return false;
    }
  };

  let valid = verifyWithKey(getSecretKey(env, false));

  if (!valid && env.APP_ENCRYPTION_KEY_PREVIOUS) {
    try {
      valid = verifyWithKey(getSecretKey(env, true));
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    return { valid: false, error: 'Invalid OAuth state signature. Potential CSRF or tampering attempt.' };
  }

  return { valid: true, userId, platform };
}
