
// Cloudflare Worker + Firebase Admin - solid base for 01 02 03
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Record<string, any> }>();

// Firebase Admin via REST (since Worker can't use Admin SDK directly, use Firestore REST API)
// ENV: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON (base64), WHATSAPP_TOKEN, SHOPIFY_API_KEY

// 01 CONNECT - Shopify OAuth + save to Firestore
app.get('/api/shopify/auth', async (c) => {
  const shop = c.req.query('shop');
  if (!shop) return c.json({ error: 'shop required' }, 400);
  // Redirect to Shopify OAuth
  const redirect = `https://${shop}/admin/oauth/authorize?client_id=${c.env.SHOPIFY_API_KEY}&scope=read_orders,write_orders,read_customers&redirect_uri=${c.env.APP_URL}/api/shopify/callback&state=${crypto.randomUUID()}`;
  return c.redirect(redirect);
});

app.get('/api/shopify/callback', async (c) => {
  const { shop, code } = c.req.query();
  // Exchange code for token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: c.env.SHOPIFY_API_KEY, client_secret: c.env.SHOPIFY_API_SECRET, code })
  });
  const { access_token } = await tokenRes.json() as any;

  // Save to Firestore via REST API - Firebase solid base
  await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/shops/${shop}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { shop: { stringValue: shop }, access_token: { stringValue: access_token }, connectedAt: { timestampValue: new Date().toISOString() }, status: { stringValue: 'connected' } } })
  });

  return c.redirect(`${c.env.APP_URL}/?shopify_connected=${shop}`);
});

// Shopify webhook: orders/fulfilled -> schedule WhatsApp +7 days -> save to Firestore
app.post('/api/shopify/webhook/fulfilled', async (c) => {
  const order = await c.req.json();
  const shop = c.req.header('X-Shopify-Shop-Domain');
  const phone = order.phone || order.customer?.phone;
  
  const triggerAt = Date.now() + 7*24*60*60*1000;
  // Save trigger to Firestore collection whatsapp_triggers
  await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/whatsapp_triggers`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { shop: { stringValue: shop }, phone: { stringValue: phone }, orderId: { stringValue: String(order.id) }, triggerAt: { integerValue: triggerAt }, status: { stringValue: 'scheduled' } } })
  });
  
  return c.json({ ok: true, scheduled: triggerAt });
});

// 02 COLLECT - WhatsApp incoming -> save video to Firebase Storage + Firestore
app.get('/api/whatsapp/incoming', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  if (mode === 'subscribe' && token === c.env.WHATSAPP_VERIFY_TOKEN) return c.text(challenge ?? '');
  return c.text('Forbidden', 403);
});

app.post('/api/whatsapp/incoming', async (c) => {
  const body = await c.req.json();
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== 'video') return c.json({ ok: true });

  const from = message.from;
  const videoId = message.video.id;
  
  // Download from Meta
  const mediaUrl = await fetch(`https://graph.facebook.com/v20.0/${videoId}`, { headers: { Authorization: `Bearer ${c.env.WHATSAPP_TOKEN}` } }).then(r => r.json()).then(j => j.url);
  const videoBuffer = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${c.env.WHATSAPP_TOKEN}` } }).then(r => r.arrayBuffer());
  void videoBuffer;

  // Upload to Firebase Storage via Google Cloud Storage JSON API
  // For simplicity using R2 in this example, replace with Firebase Storage upload
  // await c.env.PANDA_R2.put(`whatsapp/${from}/${Date.now()}.mp4`, videoBuffer);

  // Save to Firestore whatsapp_incoming
  await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/whatsapp_incoming`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { phone: { stringValue: from }, videoId: { stringValue: videoId }, status: { stringValue: 'new' }, createdAt: { timestampValue: new Date().toISOString() } } })
  });

  return c.json({ ok: true });
});

async function getFirebaseToken(env: any) {
  // In production, exchange service account JWT for OAuth token
  // Simplified: return env.FIREBASE_ID_TOKEN or use google-auth
  return env.FIREBASE_ADMIN_TOKEN;
}

export default app;
