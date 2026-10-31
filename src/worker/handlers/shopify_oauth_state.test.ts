import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleShopifyAuth, handleShopifyCallback } from './phase1_2_handlers';

const SECRET = 'shopify-test-secret';
const ENV = {
  APP_URL: 'https://pandapraise.example',
  SHOPIFY_API_KEY: 'client-id',
  SHOPIFY_API_SECRET: SECRET,
  RATE_LIMIT_KV: { put: vi.fn().mockResolvedValue(undefined) },
} as any;

async function signShopifyQuery(params: URLSearchParams): Promise<string> {
  const canonical = [...params.entries()]
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(canonical)));
  return [...signature].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function callbackRequest(params: URLSearchParams, cookieState = params.get('state')) {
  return new Request(`https://pandapraise.example/api/shopify/callback?${params}`, {
    headers: { Cookie: `shopify_oauth_state=${cookieState || ''}` },
  });
}

describe('Shopify OAuth state and callback verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('fails closed when OAuth credentials are missing', async () => {
    const response = await handleShopifyAuth(
      new Request('https://pandapraise.example/api/shopify/auth?shop=shop.myshopify.com'),
      { APP_URL: ENV.APP_URL } as any,
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('rejects invalid shop domains before starting OAuth', async () => {
    const response = await handleShopifyAuth(
      new Request('https://pandapraise.example/api/shopify/auth?shop=attacker.example'),
      ENV,
    );

    expect(response.status).toBe(400);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('starts OAuth with a CSRF state cookie and validated Shopify domain', async () => {
    const response = await handleShopifyAuth(
      new Request('https://pandapraise.example/api/shopify/auth?shop=shop.myshopify.com'),
      ENV,
    );
    const location = new URL(response.headers.get('Location') || '');
    const cookie = response.headers.get('Set-Cookie') || '';

    expect(response.status).toBe(302);
    expect(location.hostname).toBe('shop.myshopify.com');
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('rejects a state mismatch before exchanging the authorization code', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const params = new URLSearchParams({ shop: 'shop.myshopify.com', code: 'code', state: 'query-state', hmac: 'bad' });

    const response = await handleShopifyCallback(callbackRequest(params, 'cookie-state'), ENV);

    expect(response.status).toBe(302);
    expect(new URL(response.headers.get('Location')!).searchParams.get('shopify_error')).toContain('state');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid Shopify HMACs and never marks the store connected', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const params = new URLSearchParams({ shop: 'shop.myshopify.com', code: 'code', state: 'state-123', hmac: '0'.repeat(64) });

    const response = await handleShopifyCallback(callbackRequest(params), ENV);

    expect(new URL(response.headers.get('Location')!).searchParams.get('shopify_error')).toContain('signature');
    expect(new URL(response.headers.get('Location')!).searchParams.has('shopify_connected')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stores the token only after valid state, valid HMAC, and successful exchange', async () => {
    const params = new URLSearchParams({
      shop: 'shop.myshopify.com',
      code: 'one-time-code',
      state: 'state-123',
      timestamp: '1800000000',
    });
    params.set('hmac', await signShopifyQuery(params));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'server-only-token', scope: 'read_orders,write_orders' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleShopifyCallback(callbackRequest(params), ENV);

    expect(response.status).toBe(302);
    expect(new URL(response.headers.get('Location')!).searchParams.get('shopify_connected')).toBe('shop.myshopify.com');
    expect(ENV.RATE_LIMIT_KV.put).toHaveBeenCalledWith(
      'shop:shop.myshopify.com',
      expect.stringContaining('server-only-token'),
    );
    expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });
});

