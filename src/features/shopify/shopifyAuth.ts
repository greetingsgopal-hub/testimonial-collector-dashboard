/**
 * Shopify OAuth & Verification Handlers
 */

export const DEFAULT_SHOPIFY_SCOPES = [
  'read_products',
  'read_orders',
  'read_customers',
  'read_fulfillments',
];

/**
 * Builds the Shopify OAuth authorization redirect URL.
 */
export function buildShopifyAuthUrl(params: {
  shopDomain: string;
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}): string {
  const cleanDomain = params.shopDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const scopes = (params.scopes || DEFAULT_SHOPIFY_SCOPES).join(',');
  const query = new URLSearchParams({
    client_id: params.clientId,
    scope: scopes,
    redirect_uri: params.redirectUri,
    state: params.state,
    'grant_options[]': 'value',
  });

  return `https://${cleanDomain}/admin/oauth/authorize?${query.toString()}`;
}

export function generateShopifyOAuthUrl(
  shopDomain: string,
  clientId: string,
  redirectUri: string,
  state: string = 'pandapraise_shopify_auth'
): string {
  return buildShopifyAuthUrl({
    shopDomain,
    clientId,
    redirectUri,
    state,
  });
}

/**
 * Validates a myshopify.com domain format.
 */
export function isValidShopifyDomain(domain: string): boolean {
  if (!domain) return false;
  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const shopifyRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-_]*\.myshopify\.com$/;
  return shopifyRegex.test(clean);
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
