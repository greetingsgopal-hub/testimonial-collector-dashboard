import express from 'express';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { Payment } from '../models/Payment.js';

const router = express.Router();

router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const expected = crypto.createHmac('sha256', config.razorpay.webhookSecret).update(rawBody).digest('hex');
  if (expected !== signature) return res.status(400).send('Invalid signature');
  
  try {
    const event = JSON.parse(rawBody.toString());
    if (event.event === 'payment.captured') {
      const paymentId = event.payload?.payment?.entity?.id;
      const orderId = event.payload?.payment?.entity?.order_id;
      await Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'paid', razorpayPaymentId: paymentId });
      console.log(`Payment captured ${paymentId} for order ${orderId}`);
    }
  } catch (err) {
    console.warn('Webhook parse notice:', err.message);
  }
  res.json({ status: 'ok' });
});

export default router;
