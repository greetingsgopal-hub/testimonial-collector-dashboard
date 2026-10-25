import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { Payment } from '../models/Payment.js';
import { verifyJWT, requireStore } from '../middleware/auth.js';

const router = express.Router();
const rzp = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });

const DROPS = {
  starter: { amount: 1500, ads: 5 },
  growth: { amount: 2999, ads: 20 },
  scale: { amount: 6999, ads: 50 },
};

router.post('/create-order', verifyJWT, requireStore, async (req, res) => {
  const { drop } = req.body; // starter/growth/scale
  if (!DROPS[drop]) return res.status(400).json({ error: 'Invalid drop' });
  const options = { amount: DROPS[drop].amount * 100, currency: 'INR', receipt: `drop_${Date.now()}` };
  const order = await rzp.orders.create(options);
  await Payment.create({ shop: req.effectiveStore, drop, amount: DROPS[drop].amount, adsTotal: DROPS[drop].ads, adsLeft: DROPS[drop].ads, razorpayOrderId: order.id, status: 'created' });
  res.json({ orderId: order.id, amount: options.amount, key: config.razorpay.keyId });
});

router.post('/verify', verifyJWT, requireStore, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', config.razorpay.keySecret).update(body).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Signature fail' });
  const payment = await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' }, { new: true });
  res.json({ success: true, adsLeft: payment.adsLeft });
});

router.get('/usage', verifyJWT, requireStore, async (req, res) => {
  const payment = await Payment.findOne({ shop: req.effectiveStore, status: 'paid' }).sort({ createdAt: -1 });
  if (!payment) return res.json({ drop: null, adsTotal: 0, adsUsed: 0, adsLeft: 0 });
  res.json({ drop: payment.drop, adsTotal: payment.adsTotal, adsUsed: payment.adsUsed, adsLeft: payment.adsLeft, validUntil: payment.validUntil });
});

router.post('/ads/download', verifyJWT, requireStore, async (req, res) => {
  // manual check to avoid import cycle
  const active = await Payment.findOne({ shop: req.effectiveStore, status: 'paid' }).sort({ createdAt: -1 });
  if (!active || active.adsLeft <= 0) return res.status(402).json({ error: 'No ads left' });
  active.adsUsed += 1; active.adsLeft -= 1; await active.save();
  res.json({ success: true, adsLeft: active.adsLeft });
});

export default router;
