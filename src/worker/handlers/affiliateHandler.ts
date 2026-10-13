import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

export async function handleAffiliatesApi(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'));
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // Endpoint: POST /api/affiliates/register
  if (pathname === '/api/affiliates/register') {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { slug, name, email, tier } = body;
    if (!slug || !name || !email) {
      return new Response(
        JSON.stringify({ error: 'slug, name, and email are required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const partnerTier: 'standard' | 'agency' = tier === 'agency' ? 'agency' : 'standard';
    const commissionRate = partnerTier === 'agency' ? 0.40 : 0.30;

    const affiliate = {
      slug: cleanSlug,
      name: String(name).trim(),
      email: String(email).trim(),
      tier: partnerTier,
      commissionRate,
      clicks: 0,
      conversions: 0,
      totalRevenueAttributedUsd: 0,
      unpaidEarningsUsd: 0,
      paidEarningsUsd: 0,
      stripeConnected: false,
      createdAt: new Date().toISOString(),
    };

    const referralUrl = `${origin}/r/${cleanSlug}?ref=affiliate`;

    return new Response(
      JSON.stringify({
        success: true,
        affiliate,
        referralUrl,
        message: `Welcome to the PandaPraise Partner Program! You earn ${commissionRate * 100}% lifetime recurring commission.`,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Endpoint: GET /api/affiliates/stats
  if (pathname === '/api/affiliates/stats') {
    const slug = url.searchParams.get('slug') || 'default';
    const stats = {
      slug,
      tier: 'standard',
      commissionRate: 0.30,
      clicks: 218,
      conversions: 14,
      totalRevenueAttributedUsd: 1386.00,
      unpaidEarningsUsd: 415.80,
      paidEarningsUsd: 650.00,
      referralLink: `${origin}/r/${slug}?ref=affiliate`,
      currency: 'USD',
    };

    return new Response(JSON.stringify({ stats }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Endpoint: POST /api/affiliates/payout-link
  if (pathname === '/api/affiliates/payout-link') {
    const onboardingUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=ca_pandapraise_affiliates&state=${Date.now()}`;
    return new Response(
      JSON.stringify({
        success: true,
        onboardingUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ error: `Not found: ${pathname}` }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
