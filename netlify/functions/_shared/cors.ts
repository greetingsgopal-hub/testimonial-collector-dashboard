/**
 * Production CORS and HTTP method validation helper.
 */

const ALLOWED_ORIGINS = [
  'https://cheery-hummingbird-7ecc95.netlify.app',
  'https://testimonial-collector-dashboard2.greetings-gopal.workers.dev',
  'https://pandapraise.dev',
  'https://www.pandapraise.dev',
  'http://localhost:5173',
  'http://localhost:8888',
  'http://localhost:3000',
];

export function getCorsHeaders(requestOrigin?: string): Record<string, string> {
  const origin = requestOrigin || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.netlify.app');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export function handleOptionsPreflight(event: any): { statusCode: number; headers: Record<string, string>; body: string } | null {
  if (event.httpMethod === 'OPTIONS') {
    const origin = event.headers.origin || event.headers.Origin;
    return {
      statusCode: 204,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }
  return null;
}
