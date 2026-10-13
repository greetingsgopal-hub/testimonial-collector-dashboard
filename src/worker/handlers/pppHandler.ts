import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import {
  detectCurrencyFromCountry,
  PPP_CURRENCY_RATES,
  getPppDiscountBanner,
} from '../../lib/pppPricing';

export async function handlePppGeoDetection(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'));
  const url = new URL(request.url);

  // Read Cloudflare CF-IPCountry header, query param override, or fallback to US
  const headerCountry = request.headers.get('cf-ipcountry');
  const queryCountry = url.searchParams.get('country');
  const country = (queryCountry || headerCountry || 'US').toUpperCase();

  const currency = detectCurrencyFromCountry(country);
  const rates = PPP_CURRENCY_RATES[currency];
  const banner = getPppDiscountBanner(currency, country);

  return new Response(
    JSON.stringify({
      country,
      currency,
      rates,
      banner,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
