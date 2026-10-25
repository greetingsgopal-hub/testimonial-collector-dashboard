import { Context } from 'hono';
import { sanitizeShopDomain, verifyShopifyHmac } from '../../features/shopify/shopifyAuth';

export interface ShopifyEnv {
  SHOPIFY_CLIENT_ID: string;
  SHOPIFY_CLIENT_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  APP_URL: string;
}

/**
 * Handles GET /api/shopify/callback
 */
export async function handleShopifyOAuthCallback(c: Context<{ Bindings: ShopifyEnv }>) {
  const query = c.req.query();
  const { shop, code, hmac, host } = query;

  const validShop = shop ? sanitizeShopDomain(shop) : null;
  if (!validShop || !code || !hmac) {
    return c.json({ error: 'Missing or invalid Shopify OAuth parameters' }, 400);
  }

  // 1. Verify HMAC Signature
  const isValidHmac = await verifyShopifyHmac(query, c.env.SHOPIFY_CLIENT_SECRET);
  if (!isValidHmac) {
    return c.json({ error: 'Invalid HMAC signature. Potential tampering detected.' }, 403);
  }

  try {
    // 2. Exchange authorization code for permanent offline access token
    const tokenResponse = await fetch(`https://${validShop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: c.env.SHOPIFY_CLIENT_ID,
        client_secret: c.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return c.json({ error: 'Failed to exchange Shopify token', details: errText }, 502);
    }

    const { access_token, scope } = (await tokenResponse.json()) as {
      access_token: string;
      scope: string;
    };

    // 3. Auto-register orders/fulfilled webhook for COD & Review extraction
    const webhookUrl = `${c.env.APP_URL}/api/webhooks/shopify/orders-fulfilled`;
    await fetch(`https://${validShop}/admin/api/2024-10/webhooks.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token,
      },
      body: JSON.stringify({
        webhook: {
          topic: 'orders/fulfilled',
          address: webhookUrl,
          format: 'json',
        },
      }),
    });

    // 4. Save store connection metadata to Firestore via REST API (Edge-compatible)
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/shopify_stores/${validShop}?key=${c.env.FIREBASE_API_KEY}`;

    await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          shopDomain: { stringValue: validShop },
          accessToken: { stringValue: access_token },
          scopes: { stringValue: scope },
          status: { stringValue: 'connected' },
          connectedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    // 5. Redirect merchant back to the Review-to-Meta-Ad Studio
    const redirectUrl = `${c.env.APP_URL}/studio?shop=${encodeURIComponent(validShop)}&connected=true&host=${encodeURIComponent(host || '')}`;
    return c.redirect(redirectUrl, 302);
  } catch (err: any) {
    return c.json({ error: 'Internal OAuth flow error', message: err.message }, 500);
  }
}
