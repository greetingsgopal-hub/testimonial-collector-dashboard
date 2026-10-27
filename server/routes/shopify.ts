// Phase 1: Shopify OAuth + Webhook + 7-day trigger
import { Hono } from 'hono';

const app = new Hono<any>();

// 1-click OAuth start
app.get('/api/shopify/auth', (c) => {
  const shop = c.req.query('shop');
  if (!shop) return c.json({ error: 'shop required' }, 400);
  const state = crypto.randomUUID();
  const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${c.env?.SHOPIFY_API_KEY || ''}&scope=read_orders,write_orders&redirect_uri=${c.env?.APP_URL || 'https://pandapraise.com'}/api/shopify/callback&state=${state}`;
  return c.redirect(redirectUrl);
});

// OAuth callback
app.get('/api/shopify/callback', async (c) => {
  const { shop, code } = c.req.query();
  // Exchange code for access token
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        client_id: c.env?.SHOPIFY_API_KEY, 
        client_secret: c.env?.SHOPIFY_API_SECRET, 
        code 
      })
    });
    const { access_token } = await tokenRes.json() as any;
    
    // Save shop + token to KV / Firestore
    if (c.env?.PANDA_KV) {
      await c.env.PANDA_KV.put(`shop:${shop}`, JSON.stringify({ access_token, connectedAt: Date.now() }));
    }
    
    // Register webhook: orders/fulfilled
    if (access_token) {
      await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': access_token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          webhook: { 
            topic: 'orders/fulfilled', 
            address: `${c.env?.APP_URL || 'https://pandapraise.com'}/api/shopify/webhook/fulfilled`, 
            format: 'json' 
          } 
        })
      });
    }
  } catch (err) {
    console.warn('Shopify callback handshake warning:', err);
  }
  
  return c.redirect(`${c.env?.APP_URL || 'https://pandapraise.com'}/dashboard?connected=shopify&shop=${shop}`);
});

// Webhook: Order fulfilled -> Schedule WhatsApp in 7 days via Queue
app.post('/api/shopify/webhook/fulfilled', async (c) => {
  const order = await c.req.json();
  const shop = c.req.header('X-Shopify-Shop-Domain');
  const phone = order.phone || order.customer?.phone;
  const customerName = order.customer?.first_name || 'there';
  
  if (!phone) return c.json({ ok: true, skipped: 'no phone' });
  
  // Schedule WhatsApp trigger in 7 days using Cloudflare Queue + KV delayed job
  const triggerAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (c.env?.PANDA_KV) {
    await c.env.PANDA_KV.put(
      `whatsapp:trigger:${order.id}`, 
      JSON.stringify({ shop, phone, customerName, orderId: order.id, triggerAt }), 
      { expirationTtl: 8 * 24 * 60 * 60 }
    );
  }
  
  return c.json({ ok: true, scheduled: triggerAt });
});

// Manual trigger for testing (without waiting 7 days)
app.post('/api/shopify/trigger-test', async (c) => {
  const { phone } = await c.req.json();
  // Send WhatsApp template
  if (c.env?.WHATSAPP_TOKEN && c.env?.WHATSAPP_PHONE_ID) {
    await fetch(`https://graph.facebook.com/v20.0/${c.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${c.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: { 
          name: 'panda_review_request', 
          language: { code: 'en_US' }, 
          components: [{ type: 'body', parameters: [{ type: 'text', text: 'Kalyan Silks' }] }] 
        }
      })
    });
  }
  return c.json({ ok: true });
});

export default app;
