import crypto from 'crypto';
import { config } from '../config/env.js';

// Mock Shopify OAuth callback verification
export const verifyShopifyHmac = (query) => {
  const { hmac, signature, ...map } = query;
  const message = Object.keys(map).sort().map(k=>`${k}=${map[k]}`).join('&');
  const gen = crypto.createHmac('sha256', config.shopify.apiSecret).update(message).digest('hex');
  return gen === hmac;
};

// Webhook HMAC verify
export const verifyWebhookHmac = (rawBody, hmacHeader) => {
  const gen = crypto.createHmac('sha256', config.shopify.webhookSecret).update(rawBody).digest('base64');
  return gen === hmacHeader;
};
