export const SHOPIFY_SCOPES = [
  'read_products',
  'read_orders',
  'read_customers',
  'read_fulfillments',
].join(',');

export const DEFAULT_SHOPIFY_SCOPES = SHOPIFY_SCOPES.split(',');

/**
 * Validates and normalizes a Shopify domain to strict {shop}.myshopify.com format
 */
export function sanitizeShopDomain(domain: string): string | null {
  const cleaned = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  const shopRegex = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
  return shopRegex.test(cleaned) ? cleaned : null;
}

/**
 * Backward compatible domain validator
 */
export function isValidShopifyDomain(domain: string): boolean {
  return sanitizeShopDomain(domain) !== null;
}

/**
 * Generates the Shopify OAuth 2.0 authorization URL
 */
export function generateShopifyOAuthUrl(
  shopDomain: string,
  clientId: string,
  redirectUri: string,
  nonce: string = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'nonce_' + Math.random().toString(36).substring(2))
): string {
  const validShop = sanitizeShopDomain(shopDomain);
  if (!validShop) {
    throw new Error('Invalid Shopify store domain. Must end with .myshopify.com');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SHOPIFY_SCOPES,
    redirect_uri: redirectUri,
    state: nonce,
  });

  return `https://${validShop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Backward compatible auth URL builder
 */
export function buildShopifyAuthUrl(params: {
  shopDomain: string;
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}): string {
  return generateShopifyOAuthUrl(params.shopDomain, params.clientId, params.redirectUri, params.state);
}

/**
 * Normalizes an Indian phone number to E.164 (+91) format for WhatsApp automation.
 */
export function formatIndianPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  return digits.length >= 10 ? `+${digits}` : null;
}

/**
 * Verifies Shopify OAuth callback HMAC using Web Crypto API (Cloudflare Workers compatible)
 */
export async function verifyShopifyHmac(
  queryParams: Record<string, string>,
  clientSecret: string
): Promise<boolean> {
  const { hmac, ...rest } = queryParams;
  if (!hmac || !clientSecret) return false;

  // Sort keys lexicographically as required by Shopify OAuth spec
  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('&');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(clientSecret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const computedHmac = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHmac === hmac.toLowerCase();
}
