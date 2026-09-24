/**
 * CORS handling helper for Cloudflare Worker API routes.
 */

const ALLOWED_ORIGINS = [
  'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev',
  'https://cheery-hummingbird-7ecc95.netlify.app',
  'https://pandapraise.dev',
  'https://www.pandapraise.dev',
  'http://localhost:5173',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const origin = requestOrigin || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.workers.dev') || origin.endsWith('.netlify.app');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
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
