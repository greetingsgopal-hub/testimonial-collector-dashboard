import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Payment } from '../models/Payment.js';
import { verifyJWT, requireStore } from '../middleware/auth.js';

const router = express.Router();
const rzp = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });

// In-memory fallback if MongoDB connection is not established
export const memoryPayments = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

const DROPS = {
  starter: { amount: 1500, ads: 5 },
  growth: { amount: 2999, ads: 20 },
  scale: { amount: 6999, ads: 50 },
};

router.post('/create-order', verifyJWT, requireStore, async (req, res) => {
  const { drop } = req.body; // starter/growth/scale
  if (!DROPS[drop]) return res.status(400).json({ error: 'Invalid drop' });
  const options = { amount: DROPS[drop].amount * 100, currency: 'INR', receipt: `drop_${Date.now()}` };
  
  let order;
  try {
    order = await rzp.orders.create(options);
  } catch {
    order = { id: `order_${Date.now()}`, ...options };
  }

  const paymentDoc = {
    shop: req.effectiveStore,
    drop,
    amount: DROPS[drop].amount,
    adsTotal: DROPS[drop].ads,
    adsUsed: 0,
    adsLeft: DROPS[drop].ads,
    razorpayOrderId: order.id,
    status: 'created',
    createdAt: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  memoryPayments.set(order.id, paymentDoc);
  memoryPayments.set(req.effectiveStore, paymentDoc);

  if (isDbConnected()) {
    Payment.create(paymentDoc).catch(() => {});
  }

  res.json({ orderId: order.id, amount: options.amount, key: config.razorpay.keyId });
});

router.post('/verify', verifyJWT, requireStore, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, drop } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', config.razorpay.keySecret).update(body).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Signature fail' });

  let payment;
  if (isDbConnected()) {
    try {
      payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' },
        { returnDocument: 'after' }
      );
    } catch {}
  }

  if (!payment) {
    const existing = memoryPayments.get(razorpay_order_id) || {
      shop: req.effectiveStore,
      drop: drop || 'growth',
      adsTotal: 20,
      adsUsed: 0,
      adsLeft: 20,
    };
    existing.status = 'paid';
    existing.razorpayPaymentId = razorpay_payment_id;
    existing.razorpaySignature = razorpay_signature;
    memoryPayments.set(razorpay_order_id, existing);
    memoryPayments.set(req.effectiveStore, existing);
    payment = existing;
  }

  res.json({ success: true, adsLeft: payment.adsLeft });
});

router.get('/usage', verifyJWT, requireStore, async (req, res) => {
  let payment;
  if (isDbConnected()) {
    try {
      payment = await Payment.findOne({ shop: req.effectiveStore, status: 'paid' }).sort({ createdAt: -1 });
    } catch {}
  }

  if (!payment) {
    payment = memoryPayments.get(req.effectiveStore);
  }

  if (!payment) return res.json({ drop: null, adsTotal: 0, adsUsed: 0, adsLeft: 0 });
  res.json({
    drop: payment.drop,
    adsTotal: payment.adsTotal,
    adsUsed: payment.adsUsed,
    adsLeft: payment.adsLeft,
    validUntil: payment.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
});

router.post('/ads/download', verifyJWT, requireStore, async (req, res) => {
  let active;
  if (isDbConnected()) {
    try {
      active = await Payment.findOne({ shop: req.effectiveStore, status: 'paid' }).sort({ createdAt: -1 });
    } catch {}
  }

  if (!active) {
    active = memoryPayments.get(req.effectiveStore);
  }

  if (!active || active.adsLeft <= 0) return res.status(402).json({ error: 'No ads left' });
  active.adsUsed += 1;
  active.adsLeft -= 1;
  
  if (isDbConnected() && typeof active.save === 'function') {
    active.save().catch(() => {});
  } else {
    memoryPayments.set(req.effectiveStore, active);
  }

  res.json({ success: true, adsLeft: active.adsLeft });
});

export default router;
