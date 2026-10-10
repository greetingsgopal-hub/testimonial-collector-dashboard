import crypto from 'node:crypto';

/**
 * Computes a hex-encoded HMAC-SHA256 signature for a payload string using a secret.
 */
export function computeHmacSha256(secret: string, payload: string): string {
  if (!secret) throw new Error('Secret is required to compute HMAC');
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/**
 * Constant-time verification of HMAC-SHA256 signature to prevent timing attacks.
 * Accepts signature with or without "sha256=" prefix.
 */
export function verifyHmacSha256(secret: string, payload: string, signature: string): boolean {
  if (!secret || !signature) return false;

  const normalizedSig = signature.trim().replace(/^sha256=/i, '');
  const expectedSig = computeHmacSha256(secret, payload);

  try {
    const providedBuffer = Buffer.from(normalizedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
