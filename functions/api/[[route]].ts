import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';
import { handleShopifyOAuthCallback, ShopifyEnv } from '../../src/worker/handlers/shopifyOAuthHandler';
import { processShopifyOrderWebhook, generateWhatsAppVerificationMessage } from '../../src/features/shopify/shopifyWebhookHandler';
import { handleReviewIngestion } from '../../src/worker/handlers/reviewIngestionHandler';

const app = new Hono<{ Bindings: ShopifyEnv }>().basePath('/api');

app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', service: 'review-to-meta-ad-engine' }));

// 1. Shopify OAuth Callback Route
app.get('/shopify/callback', handleShopifyOAuthCallback);

// 2. Shopify Order Fulfilled Webhook Route (COD + WhatsApp Trigger)
app.post('/webhooks/shopify/orders-fulfilled', async (c) => {
  try {
    const payload = await c.req.json();
    const orderEvent = processShopifyOrderWebhook(payload);
    const whatsappPrompt = generateWhatsAppVerificationMessage(orderEvent);

    return c.json({
      success: true,
      orderId: orderEvent.orderId,
      isCodOrder: orderEvent.isCodOrder,
      whatsappTrigger: whatsappPrompt,
    }, 200);
  } catch (err: any) {
    return c.json({ error: 'Webhook processing failed', message: err.message }, 400);
  }
});

// 3. Automated Review Ingestion & Scoring Route
app.post('/reviews/ingest', handleReviewIngestion);

export const onRequest = handle(app);

export default app;
