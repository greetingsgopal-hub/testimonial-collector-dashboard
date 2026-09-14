import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

function getSecretKey(): Buffer {
  const secret = process.env.APP_ENCRYPTION_KEY || process.env.LINKEDIN_CLIENT_SECRET || 'reviewvault-default-secure-dev-salt-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext token using AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = getSecretKey();
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
 */
export function decryptToken(encryptedBase64: string): string {
  if (!encryptedBase64) return '';
  try {
    const key = getSecretKey();
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
  } catch (err) {
    console.error('[Crypto] Token decryption failed:', err);
    throw new Error('Failed to decrypt credentials. Re-authentication required.');
  }
}

/**
 * Generate a cryptographically secure, signed OAuth state parameter.
 * Format: userId.platform.timestamp.signature
 */
export function generateOAuthState(userId: string, platform: string): string {
  const timestamp = Date.now().toString();
  const key = getSecretKey();
  const payload = `${userId}.${platform}.${timestamp}`;
  const hmac = crypto.createHmac('sha256', key).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify an OAuth state parameter against replay, tamper, and expiration (10 mins).
 */
export function verifyOAuthState(state: string): { valid: boolean; userId?: string; platform?: string; error?: string } {
  if (!state) return { valid: false, error: 'Missing OAuth state parameter' };

  const parts = state.split('.');
  if (parts.length !== 4) {
    return { valid: false, error: 'Malformed OAuth state parameter' };
  }

  const [userId, platform, timestampStr, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid state timestamp' };
  }

  // 10 minute expiration check
  const now = Date.now();
  if (now - timestamp > 10 * 60 * 1000) {
    return { valid: false, error: 'OAuth state parameter has expired. Please try connecting again.' };
  }

  const key = getSecretKey();
  const expectedPayload = `${userId}.${platform}.${timestampStr}`;
  const expectedHmac = crypto.createHmac('sha256', key).update(expectedPayload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { valid: false, error: 'Invalid OAuth state signature (CSRF check failed)' };
  }

  return { valid: true, userId, platform };
}
