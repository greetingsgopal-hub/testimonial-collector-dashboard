import dotenv from 'dotenv';
dotenv.config();

const required = [
  'JWT_SECRET',
  'DATABASE_URL',
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'WHATSAPP_TOKEN'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`);
  }
}

export const config = {
  jwtSecret: process.env.JWT_SECRET,
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
    scopes: process.env.SHOPIFY_SCOPES || 'read_orders,read_customers',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    template: process.env.WHATSAPP_TEMPLATE_NAME || 'video_review_reward_7day',
  },
  orgId: process.env.ORG_ID || 'PP-KALYAN-IND-9021',
};
