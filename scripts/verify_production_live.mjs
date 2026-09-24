import assert from 'assert';

console.log('====================================================');
console.log('  LIVE PRODUCTION API BRIDGE & CORS VERIFICATION');
console.log('====================================================\n');

const NETLIFY_ORIGIN = 'https://cheery-hummingbird-7ecc95.netlify.app';
const CLOUDFLARE_ORIGIN = 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev';

const endpoints = [
  { name: 'oauth-init', method: 'POST', body: JSON.stringify({ platform: 'linkedin' }) },
  { name: 'oauth-callback', method: 'GET', query: '?code=test&state=test' },
  { name: 'social-publish', method: 'POST', body: JSON.stringify({ platform: 'linkedin' }) },
  { name: 'social-status', method: 'GET', query: '' },
  { name: 'social-disconnect', method: 'POST', body: JSON.stringify({ platform: 'linkedin' }) },
];

async function testEndpoint(ep) {
  const url = `${NETLIFY_ORIGIN}/.netlify/functions/${ep.name}${ep.query || ''}`;
  console.log(`\nTesting [${ep.name}] -> ${url}`);

  // 1. Test OPTIONS preflight with Cloudflare origin
  try {
    const optRes = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': CLOUDFLARE_ORIGIN,
        'Access-Control-Request-Method': ep.method,
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    const optStatus = optRes.status;
    const allowOrigin = optRes.headers.get('access-control-allow-origin');
    const allowMethods = optRes.headers.get('access-control-allow-methods');
    const allowHeaders = optRes.headers.get('access-control-allow-headers');
    const vary = optRes.headers.get('vary');

    console.log(`  OPTIONS status: ${optStatus}`);
    console.log(`  Access-Control-Allow-Origin: ${allowOrigin}`);
    console.log(`  Access-Control-Allow-Methods: ${allowMethods}`);
    console.log(`  Vary: ${vary}`);

    assert.ok(
      optStatus === 200 || optStatus === 204,
      `Expected 200 or 204 for OPTIONS preflight, got ${optStatus}`
    );
    assert.strictEqual(
      allowOrigin,
      CLOUDFLARE_ORIGIN,
      `Expected CORS origin to be ${CLOUDFLARE_ORIGIN}, got ${allowOrigin}`
    );
    assert.notStrictEqual(allowOrigin, '*', 'CORS origin must NEVER be wildcard (*)');
    console.log(`  ✓ PASS: OPTIONS preflight correctly allows Cloudflare production origin`);
  } catch (err) {
    console.error(`  ✗ FAIL OPTIONS: ${err.message}`);
    throw err;
  }

  // 2. Test actual request with Cloudflare origin
  try {
    const reqHeaders = {
      'Origin': CLOUDFLARE_ORIGIN,
      'Content-Type': 'application/json',
    };

    const res = await fetch(url, {
      method: ep.method,
      headers: reqHeaders,
      body: ep.method !== 'GET' ? ep.body : undefined,
    });

    const status = res.status;
    const contentType = res.headers.get('content-type') || '';
    const allowOrigin = res.headers.get('access-control-allow-origin');
    const text = await res.text();

    console.log(`  ${ep.method} status: ${status}`);
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Access-Control-Allow-Origin: ${allowOrigin}`);
    console.log(`  Body preview: ${text.substring(0, 120)}...`);

    // Verify it is NOT returning Cloudflare SPA index.html!
    assert.ok(!text.includes('<!DOCTYPE html>'), 'CRITICAL: Must NOT receive HTML index fallback');
    assert.ok(!text.includes('<html'), 'CRITICAL: Must NOT receive HTML');
    assert.ok(
      contentType.includes('application/json') || status === 204 || status === 302,
      `Expected JSON response or redirect, got ${contentType}`
    );

    // Verify CORS header on actual response
    assert.strictEqual(
      allowOrigin,
      CLOUDFLARE_ORIGIN,
      `Actual request must return Access-Control-Allow-Origin: ${CLOUDFLARE_ORIGIN}`
    );

    console.log(`  ✓ PASS: Function returned genuine API response (Status ${status}) with valid CORS`);
  } catch (err) {
    console.error(`  ✗ FAIL ${ep.method}: ${err.message}`);
    throw err;
  }
}

async function run() {
  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    try {
      await testEndpoint(ep);
      passed++;
    } catch (e) {
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`Production API Bridge Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
