import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from './crypto';

/**
 * C3 regression test — crypto fallback key.
 * getSecretKey must ONLY use APP_ENCRYPTION_KEY (or _PREVIOUS for rotation).
 * No fallback to LINKEDIN_CLIENT_SECRET, no hardcoded dev key.
 */

const VALID_ENV = {
  APP_ENCRYPTION_KEY: 'test-primary-key-material-abc123',
} as any;

describe('C3: crypto key derivation — no insecure fallbacks', () => {
  it('throws when no key is configured (empty env)', () => {
    expect(() => encryptToken('secret', {} as any)).toThrow(/No encryption key configured/);
  });

  it('throws when only LINKEDIN_CLIENT_SECRET is set — must NOT be used as fallback', () => {
    const env = { LINKEDIN_CLIENT_SECRET: 'linkedin-secret-value' } as any;
    expect(() => encryptToken('secret', env)).toThrow(/No encryption key configured/);
  });

  it('throws when APP_ENCRYPTION_KEY is empty string', () => {
    const env = { APP_ENCRYPTION_KEY: '' } as any;
    expect(() => encryptToken('secret', env)).toThrow(/No encryption key configured/);
  });

  it('encrypt/decrypt round-trip succeeds with a valid key', () => {
    const encrypted = encryptToken('my-oauth-token', VALID_ENV);
    expect(encrypted).not.toBe('my-oauth-token');
    expect(encrypted.length).toBeGreaterThan(0);
    expect(decryptToken(encrypted, VALID_ENV)).toBe('my-oauth-token');
  });

  it('ciphertext is authenticated — tampering fails decryption', () => {
    const encrypted = encryptToken('my-oauth-token', VALID_ENV);
    const tampered = encrypted.slice(0, -2) + (encrypted.endsWith('==') ? 'AA' : '==');
    expect(() => decryptToken(tampered, VALID_ENV)).toThrow();
  });

  it('supports key rotation via APP_ENCRYPTION_KEY_PREVIOUS', () => {
    const oldEnv = { APP_ENCRYPTION_KEY: 'old-key-material-xyz' } as any;
    const encrypted = encryptToken('rotated-token', oldEnv);

    // Rotate: new primary, old kept as previous
    const rotatedEnv = {
      APP_ENCRYPTION_KEY: 'new-key-material-789',
      APP_ENCRYPTION_KEY_PREVIOUS: 'old-key-material-xyz',
    } as any;

    expect(decryptToken(encrypted, rotatedEnv)).toBe('rotated-token');
  });

  it('OAuth state signed with valid key verifies, and rejects tampering', () => {
    const state = generateOAuthState('user_123', 'linkedin', VALID_ENV);
    const result = verifyOAuthState(state, VALID_ENV);
    expect(result.valid).toBe(true);
    expect(result.userId).toBe('user_123');
    expect(result.platform).toBe('linkedin');

    const tampered = state.replace('user_123', 'user_999');
    expect(verifyOAuthState(tampered, VALID_ENV).valid).toBe(false);
  });
});
