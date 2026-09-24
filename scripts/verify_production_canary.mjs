import assert from 'assert';

console.log('====================================================');
console.log('  PANDAPRAISE — LIVE PRODUCTION CANARY VERIFICATION');
console.log('  Target: https://testimonial-collector-dashboard2.greetings-gopal.workers.dev');
console.log('====================================================\n');

const BASE_URL = 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev';

let passCount = 0;
let failCount = 0;

async function testEndpoint(name, url, options, validator) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let bodyText = await res.text();
    let parsedJson = null;
    if (contentType.includes('application/json')) {
      try {
        parsedJson = JSON.parse(bodyText);
      } catch (e) {
        // ignore
      }
    }
    await validator({ status: res.status, headers: res.headers, contentType, bodyText, json: parsedJson });
    console.log(`  ✓ PASS: ${name} (Status: ${res.status}, Type: ${contentType})`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failCount++;
  }
}

// 1. Static SPA root
await testEndpoint(
  'Static React SPA root (/) returns HTML',
  `${BASE_URL}/`,
  { method: 'GET' },
  ({ status, contentType, bodyText }) => {
    assert.strictEqual(status, 200);
    assert.ok(contentType.includes('text/html'), `Expected text/html, got ${contentType}`);
    assert.ok(bodyText.includes('<div id="root"></div>') || bodyText.includes('Panda Praise'), 'SPA root element found');
  }
);

// 2. Static React SPA deep link (/dashboard)
await testEndpoint(
  'Static React SPA deep route (/dashboard) returns HTML (Client-side routing)',
  `${BASE_URL}/dashboard`,
  { method: 'GET' },
  ({ status, contentType, bodyText }) => {
    assert.strictEqual(status, 200);
    assert.ok(contentType.includes('text/html'), `Expected text/html, got ${contentType}`);
    assert.ok(bodyText.includes('id="root"'), 'SPA index.html fallback for client routes');
  }
);

// 3. /api/oauth-init (Protected endpoint: missing auth returns 401 JSON, NOT HTML!)
await testEndpoint(
  'POST /api/oauth-init returns 401 JSON API response (not HTML fallback)',
  `${BASE_URL}/api/oauth-init`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'linkedin' }),
  },
  ({ status, contentType, json }) => {
    assert.strictEqual(status, 401);
    assert.ok(contentType.includes('application/json'), `Expected application/json, got ${contentType}`);
    assert.ok(json && json.error, 'Returns JSON error message');
    assert.ok(json.error.includes('Unauthorized'), `Expected Unauthorized in error: ${json?.error}`);
  }
);

// 4. /api/oauth-callback (Without code/state parameters, redirects to dashboard with error param)
await testEndpoint(
  'GET /api/oauth-callback returns 302 Redirect to dashboard on missing params',
  `${BASE_URL}/api/oauth-callback`,
  { method: 'GET', redirect: 'manual' },
  ({ status, headers }) => {
    assert.strictEqual(status, 302);
    const location = headers.get('location') || '';
    assert.ok(location.includes('/dashboard'), `Expected redirect to /dashboard, got ${location}`);
    assert.ok(location.includes('social_error=Missing%20authorization%20parameters'), `Expected Missing authorization parameters in redirect: ${location}`);
  }
);

// 5. /api/social-publish (Protected endpoint: missing auth returns 401 JSON)
await testEndpoint(
  'POST /api/social-publish returns 401 JSON API response (not HTML fallback)',
  `${BASE_URL}/api/social-publish`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testimonialId: 'test-123' }),
  },
  ({ status, contentType, json }) => {
    assert.strictEqual(status, 401);
    assert.ok(contentType.includes('application/json'), `Expected application/json, got ${contentType}`);
    assert.ok(json && json.error, 'Returns JSON error message');
  }
);

// 6. /api/social-status (Protected endpoint: missing auth returns 401 JSON)
await testEndpoint(
  'GET /api/social-status returns 401 JSON API response (not HTML fallback)',
  `${BASE_URL}/api/social-status`,
  { method: 'GET' },
  ({ status, contentType, json }) => {
    assert.strictEqual(status, 401);
    assert.ok(contentType.includes('application/json'), `Expected application/json, got ${contentType}`);
    assert.ok(json && json.error, 'Returns JSON error message');
  }
);

// 7. /api/social-disconnect (Protected endpoint: missing auth returns 401 JSON)
await testEndpoint(
  'POST /api/social-disconnect returns 401 JSON API response (not HTML fallback)',
  `${BASE_URL}/api/social-disconnect`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'linkedin' }),
  },
  ({ status, contentType, json }) => {
    assert.strictEqual(status, 401);
    assert.ok(contentType.includes('application/json'), `Expected application/json, got ${contentType}`);
    assert.ok(json && json.error, 'Returns JSON error message');
  }
);

// 8. Legacy /.netlify/functions/social-status alias (Confirm backward compatibility)
await testEndpoint(
  'GET /.netlify/functions/social-status returns 401 JSON API response (backward compat alias)',
  `${BASE_URL}/.netlify/functions/social-status`,
  { method: 'GET' },
  ({ status, contentType, json }) => {
    assert.strictEqual(status, 401);
    assert.ok(contentType.includes('application/json'), `Expected application/json, got ${contentType}`);
    assert.ok(json && json.error, 'Returns JSON error message');
  }
);

// 9. OPTIONS Preflight CORS handling on /api/*
await testEndpoint(
  'OPTIONS /api/social-status returns 204 No Content with restrictive CORS headers',
  `${BASE_URL}/api/social-status`,
  {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev',
      'Access-Control-Request-Method': 'GET',
    },
  },
  ({ status, headers }) => {
    assert.strictEqual(status, 204);
    assert.strictEqual(
      headers.get('access-control-allow-origin'),
      'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev'
    );
    assert.notStrictEqual(headers.get('access-control-allow-origin'), '*');
  }
);

console.log(`\n====================================================`);
console.log(`Production Canary Results: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`====================================================`);

if (failCount > 0) {
  process.exit(1);
}
