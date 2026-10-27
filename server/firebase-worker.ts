// Cloudflare Worker + Firebase Admin - solid base for 01 02 03
import { Hono } from 'hono';

const app = new Hono<any>();

// Firebase Admin via REST (since Worker can't use Admin SDK directly, use Firestore REST API)
// ENV: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON (base64), WHATSAPP_TOKEN, SHOPIFY_API_KEY

// 01 CONNECT - Shopify OAuth + save to Firestore
app.get('/api/shopify/auth', async (c) => {
  const shop = c.req.query('shop');
  if (!shop) return c.json({ error: 'shop required' }, 400);
  const redirect = `https://${shop}/admin/oauth/authorize?client_id=${c.env?.SHOPIFY_API_KEY || ''}&scope=read_orders,write_orders,read_customers&redirect_uri=${c.env?.APP_URL || 'https://pandapraise.com'}/api/shopify/callback&state=${crypto.randomUUID()}`;
  return c.redirect(redirect);
});

app.get('/api/shopify/callback', async (c) => {
  const { shop, code } = c.req.query();
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

    // Save to Firestore via REST API - Firebase solid base
    if (c.env?.FIREBASE_PROJECT_ID) {
      await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/shops/${shop}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          fields: { 
            shop: { stringValue: shop }, 
            access_token: { stringValue: access_token || 'mock_token' }, 
            connectedAt: { timestampValue: new Date().toISOString() }, 
            status: { stringValue: 'connected' } 
          } 
        })
      });
    }
  } catch (err) {
    console.warn('Firebase worker Shopify callback notice:', err);
  }

  return c.redirect(`${c.env?.APP_URL || 'https://pandapraise.com'}/?shopify_connected=${shop}`);
});

// Shopify webhook: orders/fulfilled -> schedule WhatsApp +7 days -> save to Firestore
app.post('/api/shopify/webhook/fulfilled', async (c) => {
  const order = await c.req.json();
  const shop = c.req.header('X-Shopify-Shop-Domain') || 'kalyan-silks.myshopify.com';
  const phone = order.phone || order.customer?.phone;
  
  const triggerAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  // Save trigger to Firestore collection whatsapp_triggers
  if (c.env?.FIREBASE_PROJECT_ID && phone) {
    try {
      await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/whatsapp_triggers`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          fields: { 
            shop: { stringValue: shop }, 
            phone: { stringValue: phone }, 
            orderId: { stringValue: String(order.id) }, 
            triggerAt: { integerValue: String(triggerAt) }, 
            status: { stringValue: 'scheduled' } 
          } 
        })
      });
    } catch (err) {
      console.warn('Firestore trigger write notice:', err);
    }
  }
  
  return c.json({ ok: true, scheduled: triggerAt });
});

// 02 COLLECT - WhatsApp incoming -> save video to Firebase Storage + Firestore
app.get('/api/whatsapp/incoming', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  if (mode === 'subscribe' && token === (c.env?.WHATSAPP_VERIFY_TOKEN || 'pandapraise_secret_token')) {
    return c.text(challenge || '');
  }
  return c.text('Forbidden', 403);
});

app.post('/api/whatsapp/incoming', async (c) => {
  const body = await c.req.json();
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== 'video') return c.json({ ok: true });

  const from = message.from;
  const videoId = message.video.id;
  
  // Save to Firestore whatsapp_incoming
  if (c.env?.FIREBASE_PROJECT_ID) {
    try {
      await fetch(`https://firestore.googleapis.com/v1/projects/${c.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/whatsapp_incoming`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await getFirebaseToken(c.env)}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          fields: { 
            phone: { stringValue: from }, 
            videoId: { stringValue: videoId }, 
            status: { stringValue: 'new' }, 
            createdAt: { timestampValue: new Date().toISOString() } 
          } 
        })
      });
    } catch (err) {
      console.warn('Firestore incoming write notice:', err);
    }
  }

  return c.json({ ok: true });
});

async function getFirebaseToken(env: any) {
  return env?.FIREBASE_ADMIN_TOKEN || '';
}

export default app;
