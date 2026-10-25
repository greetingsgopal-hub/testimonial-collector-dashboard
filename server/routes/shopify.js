import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Shop } from '../models/Shop.js';

const router = express.Router();

router.get('/auth/shopify', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop');
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${process.env.APP_URL}/auth/shopify/callback`;
  const url = `https://${shop}/admin/oauth/authorize?client_id=${config.shopify.apiKey}&scope=${config.shopify.scopes}&state=${state}&redirect_uri=${redirectUri}`;
  res.redirect(url);
});

router.get('/auth/shopify/callback', async (req, res) => {
  const { shop, hmac, code } = req.query;
  const map = { ...req.query }; delete map.hmac; delete map.signature;
  const message = Object.keys(map).sort().map(k=>`${k}=${map[k]}`).join('&');
  const genHmac = crypto.createHmac('sha256', config.shopify.apiSecret).update(message).digest('hex');
  if (genHmac !== hmac) return res.status(400).send('HMAC fail');

  // Exchange code for token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: config.shopify.apiKey, client_secret: config.shopify.apiSecret, code })
  });
  const { access_token } = await tokenRes.json();

  await Shop.findOneAndUpdate({ shop }, { shop, accessToken: access_token, installedAt: new Date() }, { upsert: true });

  const token = jwt.sign({ storeDomain: shop, role: 'merchant_admin', orgId: config.orgId }, config.jwtSecret, { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}&shop=${shop}`);
});

router.post('/webhook/orders/create', express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }), async (req, res) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const gen = crypto.createHmac('sha256', config.shopify.webhookSecret).update(req.rawBody).digest('base64');
  if (gen !== hmac) return res.status(401).send('HMAC fail');
  // If fulfilled, queue WhatsApp DM after 7 days (for test 2 min)
  // await queue.add('whatsapp-dm', { order: req.body }, { delay: 7*24*60*60*1000 });
  res.status(200).send('ok');
});

export default router;
