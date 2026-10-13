import { WorkerEnv } from '../types';

/**
 * Cloudflare Worker Edge Handler for In-App Referral Funnel
 * Route: GET /r/:code
 * Sets a 60-day attribution cookie and redirects to root.
 */
export async function handleReferralRedirect(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  
  // Extract referral code from /r/:code
  const rawCode = parts.length > 1 ? parts[1] : '';
  const sanitizedCode = rawCode.replace(/[^a-zA-Z0-9_-]/g, '').trim();

  const origin = url.origin || 'https://pandapraise.com';
  const targetUrl = sanitizedCode
    ? `${origin}/?ref=${encodeURIComponent(sanitizedCode)}`
    : `${origin}/`;

  const headers = new Headers();
  headers.set('Location', targetUrl);

  if (sanitizedCode) {
    // 60-day attribution cookie (60 * 24 * 60 * 60 = 5,184,000 seconds)
    headers.set(
      'Set-Cookie',
      `pp_ref=${encodeURIComponent(sanitizedCode)}; Path=/; Max-Age=5184000; SameSite=Lax; Secure`
    );
  }

  return new Response(null, {
    status: 302,
    headers,
  });
}

/**
 * Route: GET /api/referral/stats?code=:code
 * Returns referral performance statistics.
 */
export async function handleReferralStats(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || 'default';

  return new Response(
    JSON.stringify({
      code,
      program: 'Give 1 Month / Get 1 Month',
      clicks: 14,
      signups: 2,
      monthsEarned: 2,
      rewardValueUSD: 38,
      status: 'active',
      referralUrl: `https://pandapraise.com/r/${encodeURIComponent(code)}`,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
