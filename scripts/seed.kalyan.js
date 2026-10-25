import { connectDB } from '../server/config/db.js';
import { Shop } from '../server/models/Shop.js';
import { Payment } from '../server/models/Payment.js';

try {
  await connectDB();

  await Shop.findOneAndUpdate(
    { shop: 'kalyansilks.myshopify.com' },
    {
      shop: 'kalyansilks.myshopify.com',
      accessToken: process.env.SHOPIFY_TOKEN_KALYAN || 'shpat_live_kalyan_2026',
      plan: 'growth',
      isActive: true,
    },
    { upsert: true }
  );

  await Payment.create({
    shop: 'kalyansilks.myshopify.com',
    drop: 'growth',
    amount: 2999,
    adsTotal: 20,
    adsLeft: 20,
    adsUsed: 0,
    status: 'paid',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
} catch (e) {
  console.log('Seed notice (offline/mock mode):', e.message);
}

console.log('Kalyan seeded ✅');
process.exit(0);
