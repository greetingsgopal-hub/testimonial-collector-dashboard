import assert from 'assert';
import { generateOAuthState, verifyOAuthState, encryptToken, decryptToken } from '../src/worker/lib/crypto.js';
import { checkRateLimit } from '../src/worker/lib/rateLimit.js';
import { getCorsHeaders, handleOptionsPreflight } from '../src/worker/lib/cors.js';
import workerRouter from '../src/worker/index.js';

console.log('====================================================');
console.log('  CLOUDFLARE WORKER MIGRATION VERIFICATION SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    -> ${err.message}`);
    failCount++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    -> ${err.message}`);
    failCount++;
  }
}

const mockEnv = {
  ASSETS: {
    fetch: async (req) => new Response('Mock SPA index.html', { status: 200, headers: { 'Content-Type': 'text/html' } }),
  },
  FIREBASE_API_KEY: 'mock-firebase-api-key',
  FIREBASE_PROJECT_ID: 'testimonialcollectordashboard',
  LINKEDIN_CLIENT_ID: 'mock_linkedin_client_id_123',
  LINKEDIN_CLIENT_SECRET: 'mock_linkedin_client_secret_xyz',
  LINKEDIN_REDIRECT_URI: 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/oauth-callback',
  APP_ENCRYPTION_KEY: 'test-app-encryption-key-32-chars-long!',
};

// -------------------------------------------------------------
// 1. ROUTING & ASSETS FALLBACK
// -------------------------------------------------------------
console.log('--- 1. Testing Cloudflare Worker Routing Architecture ---');

await itAsync('Worker Router: Non-API route /dashboard delegates to env.ASSETS (SPA fallback)', async () => {
  const req = new Request('https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/dashboard');
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 200);
  const text = await res.text();
  assert.strictEqual(text, 'Mock SPA index.html');
});

await itAsync('Worker Router: OPTIONS preflight to /api/oauth-init returns 204 with CORS headers', async () => {
  const req = new Request('https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/oauth-init', {
    method: 'OPTIONS',
    headers: { 'Origin': 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev' },
  });
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 204);
  assert.strictEqual(
    res.headers.get('Access-Control-Allow-Origin'),
    'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev'
  );
  assert.notStrictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & AUTHORIZATION
// -------------------------------------------------------------
console.log('\n--- 2. Testing Authentication & Authorization Controls ---');

await itAsync('Auth Gate: Missing Bearer token on /api/social-status returns 401 JSON', async () => {
  const req = new Request('https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/social-status', {
    method: 'GET',
  });
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.error, 'Unauthorized');
});

await itAsync('Auth Gate: Invalid Bearer token on /api/social-publish returns 401 JSON', async () => {
  const req = new Request('https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/social-publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid.token.payload',
    },
    body: JSON.stringify({ reviewId: 'rev-1', platform: 'linkedin', caption: 'Test' }),
  });
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.ok(data.error.includes('Unauthorized'));
});

await itAsync('Auth Gate: Missing Bearer token on /api/social-disconnect returns 401 JSON', async () => {
  const req = new Request('https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/social-disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'linkedin' }),
  });
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.error, 'Unauthorized');
});

// -------------------------------------------------------------
// 3. OAUTH CRYPTOGRAPHY & STATE INTEGRITY
// -------------------------------------------------------------
console.log('\n--- 3. Testing OAuth Cryptography & State Security ---');

it('OAuth State: Generates cryptographically secure state with nonce', () => {
  const state = generateOAuthState('user-123', 'linkedin', mockEnv);
  assert.ok(state);
  const parts = state.split('.');
  assert.strictEqual(parts.length, 5, 'State format must be userId.platform.timestamp.nonce.signature');
  assert.strictEqual(parts[0], 'user-123');
  assert.strictEqual(parts[1], 'linkedin');
});

it('OAuth State: Valid state verifies successfully with matching userId and platform', () => {
  const state = generateOAuthState('user-456', 'linkedin', mockEnv);
  const res = verifyOAuthState(state, mockEnv);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.userId, 'user-456');
  assert.strictEqual(res.platform, 'linkedin');
});

it('OAuth State: Tampered userId in state fails HMAC signature verification (CSRF blocked)', () => {
  const state = generateOAuthState('user-456', 'linkedin', mockEnv);
  const tampered = 'attacker-789' + state.substring('user-456'.length);
  const res = verifyOAuthState(tampered, mockEnv);
  assert.strictEqual(res.valid, false);
  assert.ok(res.error.includes('Invalid OAuth state signature'));
});

it('OAuth State: Expired state (>10 minutes) is rejected', () => {
  const oldTimestamp = (Date.now() - 11 * 60 * 1000).toString();
  const fakeState = `user-1.linkedin.${oldTimestamp}.nonce123.sig`;
  const res = verifyOAuthState(fakeState, mockEnv);
  assert.strictEqual(res.valid, false);
  assert.ok(res.error.includes('expired'));
});

// -------------------------------------------------------------
// 4. AES-256-GCM CREDENTIAL ENCRYPTION & KEY ROTATION
// -------------------------------------------------------------
console.log('\n--- 4. Testing AES-256-GCM Credential Encryption & Rotation ---');

it('Token Encryption: Plaintext token encrypts to AES-256-GCM base64 ciphertext', () => {
  const secretToken = 'AQV8k...sample-access-token-12345';
  const encrypted = encryptToken(secretToken, mockEnv);
  assert.notStrictEqual(encrypted, secretToken);
  assert.ok(!encrypted.includes(secretToken));
  
  const decrypted = decryptToken(encrypted, mockEnv);
  assert.strictEqual(decrypted, secretToken);
});

it('Token Encryption: Decrypts with previous key during key rotation', () => {
  const prevEnv = {
    ...mockEnv,
    APP_ENCRYPTION_KEY: 'old-primary-key-32-chars-entropy!!',
  };
  const secretToken = 'AQV_rotate_me_safely_999';
  const encryptedWithOldKey = encryptToken(secretToken, prevEnv);

  // New environment with rotated primary key and previous key configured
  const rotatedEnv = {
    ...mockEnv,
    APP_ENCRYPTION_KEY: 'new-primary-key-32-chars-entropy!!',
    APP_ENCRYPTION_KEY_PREVIOUS: 'old-primary-key-32-chars-entropy!!',
  };

  const decrypted = decryptToken(encryptedWithOldKey, rotatedEnv);
  assert.strictEqual(decrypted, secretToken, 'Must decrypt cleanly using previous key fallback');
});

// -------------------------------------------------------------
// 5. OAUTH CALLBACK BEHAVIOR
// -------------------------------------------------------------
console.log('\n--- 5. Testing OAuth Callback Handling & Redirects ---');

await itAsync('OAuth Callback: User cancellation or error redirects to dashboard with error toast', async () => {
  const req = new Request(
    'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/oauth-callback?error=user_cancelled_login',
    { method: 'GET' }
  );
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 302);
  const location = res.headers.get('Location') || '';
  assert.ok(location.includes('/dashboard?social_error='));
});

await itAsync('OAuth Callback: Missing authorization code/state redirects to dashboard with error toast', async () => {
  const req = new Request(
    'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev/api/oauth-callback',
    { method: 'GET' }
  );
  const res = await workerRouter.fetch(req, mockEnv, {});
  assert.strictEqual(res.status, 302);
  const location = res.headers.get('Location') || '';
  assert.ok(location.includes('/dashboard?social_error=Missing%20authorization%20parameters'));
});

// -------------------------------------------------------------
// 6. IN-MEMORY RATE LIMITING
// -------------------------------------------------------------
console.log('\n--- 6. Testing Worker In-Memory Rate Limiting ---');

it('Rate Limiting: Blocks bursts exceeding configured request window', () => {
  const key = 'test_flood_user_' + Date.now();
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(key, 5, 60000);
    assert.strictEqual(res.allowed, true);
  }
  const blocked = checkRateLimit(key, 5, 60000);
  assert.strictEqual(blocked.allowed, false);
  assert.strictEqual(blocked.remaining, 0);
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n====================================================');
console.log(`Cloudflare Migration Tests: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
}
