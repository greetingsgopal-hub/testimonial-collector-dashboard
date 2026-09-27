/**
 * CORS handling helper for Cloudflare Worker API routes.
 */

const ALLOWED_ORIGINS = [
  'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev',
  'https://cheery-hummingbird-7ecc95.netlify.app',
  'https://pandapraise.com',
  'https://www.pandapraise.com',
  'http://localhost:5173',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const origin = requestOrigin || '';
  // Exact-match allowlist only. Suffix wildcards (*.workers.dev / *.netlify.app)
  // would let any attacker register a preview subdomain and make credentialed
  // cross-origin requests. Unknown origins get NO Access-Control-Allow-Origin.
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  if (!isAllowed) {
    return {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Vary': 'Origin',
    };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export function handleOptionsPreflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin');
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }
  return null;
}
