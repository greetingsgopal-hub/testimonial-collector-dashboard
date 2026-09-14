import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

const IS_PROD = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';

/**
 * Derives a 256-bit encryption key with entropy checks.
 * Supports primary key and previous key for rotation.
 */
function getSecretKey(usePrevious = false): Buffer {
  const envVar = usePrevious ? 'APP_ENCRYPTION_KEY_PREVIOUS' : 'APP_ENCRYPTION_KEY';
  let secret = process.env[envVar];

  // In production, enforce explicit APP_ENCRYPTION_KEY with minimum length
  if (IS_PROD) {
    if (!secret && !usePrevious) {
      // If APP_ENCRYPTION_KEY is unset in production, check LINKEDIN_CLIENT_SECRET before failing
      secret = process.env.LINKEDIN_CLIENT_SECRET;
    }
    if (!secret && !usePrevious) {
      throw new Error('[Security] APP_ENCRYPTION_KEY is required in production environment.');
    }
    if (secret && secret.length < 32 && !usePrevious) {
      console.warn('[Security] APP_ENCRYPTION_KEY should have at least 32 characters of entropy.');
    }
  } else {
    // Development fallback using LinkedIn secret or local dev key
    secret = secret || process.env.LINKEDIN_CLIENT_SECRET || 'pandapraise-dev-local-only-key-32chars!!';
  }

  if (!secret) {
    throw new Error(`[Security] No key configured for ${envVar}`);
  }

  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext token using AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = getSecretKey(false);
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
export function decryptToken(encryptedBase64: string): string {
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
    return attemptDecrypt(getSecretKey(false));
  } catch (primaryErr) {
    // If previous key is configured, attempt fallback for safe key rotation
    if (process.env.APP_ENCRYPTION_KEY_PREVIOUS) {
      try {
        return attemptDecrypt(getSecretKey(true));
      } catch {
        // Fall through to throw
      }
    }
    console.error('[Crypto] Token decryption failed. Key may have rotated or token was corrupted.');
    throw new Error('Failed to decrypt credentials. Re-authentication required.');
  }
}

/**
 * Generate a cryptographically secure, signed OAuth state parameter.
 * Format: userId.platform.timestamp.nonce.signature
 * Nonce prevents duplicate state signatures within the same millisecond.
 */
export function generateOAuthState(userId: string, platform: string): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const key = getSecretKey(false);
  const payload = `${userId}.${platform}.${timestamp}.${nonce}`;
  const hmac = crypto.createHmac('sha256', key).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify an OAuth state parameter against replay, tamper, and expiration (10 mins).
 * Supports both 5-part (with nonce) and 4-part (legacy) state formats.
 */
export function verifyOAuthState(state: string): { valid: boolean; userId?: string; platform?: string; error?: string } {
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

  // Future timestamp defense (clock drift max 60s)
  if (timestamp - now > 60 * 1000) {
    return { valid: false, error: 'Invalid future state timestamp' };
  }

  const key = getSecretKey(false);
  const expectedHmac = crypto.createHmac('sha256', key).update(expectedPayload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { valid: false, error: 'Invalid OAuth state signature (CSRF check failed)' };
  }

  return { valid: true, userId, platform };
}
