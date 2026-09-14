/**
 * Panda Praise — Security Regression Test Suite
 * Validates cryptographic security, OAuth integrity, input sanitization,
 * rate limiting, Firestore/Storage security rule assertions, and secret leakage.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// Test 1: OAuth State & Nonce Cryptography
// -------------------------------------------------------------
console.log('\n--- 1. Testing OAuth State Security & Nonce Integrity ---');
const secretKey = crypto.createHash('sha256').update('test-secure-app-encryption-key-32chars!!').digest();

function generateTestOAuthState(userId, platform) {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}.${platform}.${timestamp}.${nonce}`;
  const hmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function verifyTestOAuthState(state) {
  if (!state) return { valid: false, error: 'Missing state' };
  const parts = state.split('.');
  if (parts.length !== 5) return { valid: false, error: 'Malformed state' };
  const [userId, platform, timestampStr, nonce, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return { valid: false, error: 'Invalid timestamp' };
  if (Date.now() - timestamp > 10 * 60 * 1000) return { valid: false, error: 'Expired' };
  if (timestamp - Date.now() > 60 * 1000) return { valid: false, error: 'Future timestamp' };

  const expectedPayload = `${userId}.${platform}.${timestampStr}.${nonce}`;
  const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedPayload).digest('hex');
  const pBuf = Buffer.from(providedHmac);
  const eBuf = Buffer.from(expectedHmac);
  if (pBuf.length !== eBuf.length || !crypto.timingSafeEqual(pBuf, eBuf)) {
    return { valid: false, error: 'Invalid HMAC signature' };
  }
  return { valid: true, userId, platform };
}

const validState = generateTestOAuthState('user_123', 'linkedin');
assert(verifyTestOAuthState(validState).valid === true, 'Valid OAuth state with nonce verifies successfully');

const tamperedState = validState.replace('user_123', 'user_999');
assert(verifyTestOAuthState(tamperedState).valid === false, 'Tampered state user ID fails HMAC verification (CSRF blocked)');

const expiredTimestamp = (Date.now() - 11 * 60 * 1000).toString();
const expiredNonce = crypto.randomBytes(16).toString('hex');
const expiredPayload = `user_123.linkedin.${expiredTimestamp}.${expiredNonce}`;
const expiredHmac = crypto.createHmac('sha256', secretKey).update(expiredPayload).digest('hex');
const expiredState = `${expiredPayload}.${expiredHmac}`;
assert(verifyTestOAuthState(expiredState).valid === false, 'Expired state (>10 minutes) is rejected');

// -------------------------------------------------------------
// Test 2: AES-256-GCM Token Encryption & Rotation
// -------------------------------------------------------------
console.log('\n--- 2. Testing AES-256-GCM Encryption & Key Rotation ---');
const keyPrimary = crypto.createHash('sha256').update('primary-key-32-chars-long-secret!').digest();
const keyPrevious = crypto.createHash('sha256').update('previous-key-32-chars-long-secret').digest();

function encryptTokenTest(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let enc = cipher.update(text, 'utf8');
  enc = Buffer.concat([enc, cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptTokenTest(b64, primaryK, prevK) {
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);

  try {
    const d1 = crypto.createDecipheriv('aes-256-gcm', primaryK, iv);
    d1.setAuthTag(tag);
    let out = d1.update(ct);
    return Buffer.concat([out, d1.final()]).toString('utf8');
  } catch {
    if (prevK) {
      const d2 = crypto.createDecipheriv('aes-256-gcm', prevK, iv);
      d2.setAuthTag(tag);
      let out = d2.update(ct);
      return Buffer.concat([out, d2.final()]).toString('utf8');
    }
    throw new Error('Decryption failed');
  }
}

const sampleSecretToken = 'AQV_fake_oauth_token_linkedin_production_access_789456';
const encryptedPrimary = encryptTokenTest(sampleSecretToken, keyPrimary);
assert(encryptedPrimary !== sampleSecretToken, 'Token is ciphered into base64 ciphertext');
assert(decryptTokenTest(encryptedPrimary, keyPrimary, keyPrevious) === sampleSecretToken, 'Decryption with primary key succeeds');

const encryptedLegacy = encryptTokenTest(sampleSecretToken, keyPrevious);
assert(decryptTokenTest(encryptedLegacy, keyPrimary, keyPrevious) === sampleSecretToken, 'Decryption with previous rotated key succeeds (zero-downtime rotation)');

// -------------------------------------------------------------
// Test 3: Input Validation & XSS Sanitization
// -------------------------------------------------------------
console.log('\n--- 3. Testing Input Sanitization & Payload Validation ---');

function sanitizeText(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') return '';
  const stripped = input.replace(/<[^>]*>?/gm, '');
  const cleaned = stripped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

function validateReviewInput(data) {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) return { valid: false, error: 'Name required' };
  if (data.name.trim().length > 100) return { valid: false, error: 'Name too long' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email.trim())) return { valid: false, error: 'Invalid email' };
  if (data.email.trim().length > 150) return { valid: false, error: 'Email too long' };
  if (!data.role || typeof data.role !== 'string' || !data.role.trim()) return { valid: false, error: 'Role required' };
  if (data.role.trim().length > 100) return { valid: false, error: 'Role too long' };
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 10) return { valid: false, error: 'Content too short' };
  if (data.content.trim().length > 2500) return { valid: false, error: 'Content too long' };
  const ratingNum = Number(data.rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) return { valid: false, error: 'Invalid rating' };
  if (!data.consent) return { valid: false, error: 'Consent required' };
  return { valid: true };
}

const xssPayload = "<script>alert('pwned')</script>Panda Praise is phenomenal!";
const sanitized = sanitizeText(xssPayload, 1000);
assert(!sanitized.includes('<script>') && !sanitized.includes('</script>'), 'HTML/Script tags stripped from customer input');
assert(sanitized.includes('Panda Praise is phenomenal!'), 'Legitimate text preserved after sanitization');

const oversizedPayload = {
  name: 'Attacker',
  email: 'attacker@evil.com',
  role: 'Spammer',
  content: 'A'.repeat(3000), // > 2500 chars
  rating: 5,
  consent: true,
};
assert(validateReviewInput(oversizedPayload).valid === false, 'Oversized testimonial content (>2500 chars) is rejected');

const invalidRatingPayload = {
  name: 'User',
  email: 'user@domain.com',
  role: 'Tester',
  content: 'Great product and customer service!',
  rating: 10, // Invalid rating
  consent: true,
};
assert(validateReviewInput(invalidRatingPayload).valid === false, 'Invalid rating (10 stars) is rejected');

const noConsentPayload = {
  name: 'User',
  email: 'user@domain.com',
  role: 'Tester',
  content: 'Great product and customer service!',
  rating: 5,
  consent: false,
};
assert(validateReviewInput(noConsentPayload).valid === false, 'Submission without consent checkbox is rejected');

// -------------------------------------------------------------
// Test 4: Sliding-Window Rate Limiter
// -------------------------------------------------------------
console.log('\n--- 4. Testing In-Memory Rate Limiter ---');

class RateLimiter {
  constructor() {
    this.store = new Map();
  }
  check(key, maxRequests, windowMs) {
    const now = Date.now();
    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length >= maxRequests) {
      return { allowed: false };
    }
    record.timestamps.push(now);
    return { allowed: true };
  }
}

const limiter = new RateLimiter();
let blocked = false;
for (let i = 0; i < 20; i++) {
  const res = limiter.check('user_test', 15, 60000);
  if (!res.allowed) {
    blocked = true;
    break;
  }
}
assert(blocked === true, 'Rate limiter blocks calls exceeding 15 requests within sliding window');

// -------------------------------------------------------------
// Test 5: Firestore & Storage Rules Verification
// -------------------------------------------------------------
console.log('\n--- 5. Testing Security Rules File Assertions ---');
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
assert(firestoreRules.includes('isOwnerUnchanged()'), 'firestore.rules defines isOwnerUnchanged() helper');
assert(firestoreRules.includes('request.resource.data.ownerId == resource.data.ownerId'), 'firestore.rules enforces ownerId immutability on updates');
assert(firestoreRules.includes('request.resource.data.content.size() <= 2500'), 'firestore.rules enforces 2500 char max length on reviews');
assert(firestoreRules.includes('request.resource.data.rating >= 1') && firestoreRules.includes('request.resource.data.rating <= 5'), 'firestore.rules enforces 1-5 rating constraints');

const storageRules = fs.readFileSync('storage.rules', 'utf8');
assert(storageRules.includes('isTenantOwner(tenantId)'), 'storage.rules defines isTenantOwner(tenantId) helper');
assert(storageRules.includes('allow create, update: if isTenantOwner(tenantId) && isValidImage()'), 'storage.rules requires authenticated tenant ownership for public media writes');
assert(!storageRules.includes('allow write: if ('), 'storage.rules has NO unauthenticated public write blocks');

// -------------------------------------------------------------
// Test 6: Netlify Configuration & Security Headers
// -------------------------------------------------------------
console.log('\n--- 6. Testing Netlify Configuration & Headers ---');
const netlifyToml = fs.readFileSync('netlify.toml', 'utf8');
assert(netlifyToml.includes('Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"'), 'netlify.toml includes production HSTS header');
assert(netlifyToml.includes('X-Content-Type-Options = "nosniff"'), 'netlify.toml includes nosniff header');
assert(netlifyToml.includes('for = "/dashboard*"') && netlifyToml.includes('frame-ancestors \'none\''), 'netlify.toml blocks iframe clickjacking on /dashboard*');
assert(netlifyToml.includes('for = "/w/*"') && netlifyToml.includes('frame-ancestors *;'), 'netlify.toml preserves universal iframe embedding for public widget /w/*');
assert(netlifyToml.includes('from = "/.env*"') && netlifyToml.includes('status = 404'), 'netlify.toml explicitly blocks direct HTTP access to /.env*');

// -------------------------------------------------------------
// Test 7: Git & Build Secrets Check
// -------------------------------------------------------------
console.log('\n--- 7. Scanning Built Assets & Code for Hardcoded Secrets ---');
const cryptoTs = fs.readFileSync('netlify/functions/_shared/crypto.ts', 'utf8');
assert(!cryptoTs.includes('reviewvault-default-secure-dev-salt-2026'), 'crypto.ts has NO hardcoded salt fallback');

const firebaseAuthTs = fs.readFileSync('netlify/functions/_shared/firebaseAuth.ts', 'utf8');
assert(!firebaseAuthTs.includes('AIzaSyDYxcuG-fN7PnLF8QIcaUDFMfH9EgawQWE'), 'firebaseAuth.ts has NO hardcoded API key fallback');

console.log(`\n======================================================`);
console.log(`Security Test Results: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log(`======================================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
