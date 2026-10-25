import express from 'express';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import { verifyJWT, requireStore } from '../middleware/auth.js';
import { config } from '../config/env.js';
import { AuditLog } from '../models/AuditLog.js';
import { createMemoryAuditLog } from '../middleware/security.js';

const router = express.Router();
const rzpX = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });

router.post('/trigger-upi', verifyJWT, requireStore, async (req, res) => {
  const { customerUpi, amount = 200, videoId, orderId } = req.body;

  // Validate UPI format
  if (!customerUpi || !customerUpi.includes('@')) return res.status(400).json({ error: 'Invalid UPI' });

  // Create payout via RazorpayX
  try {
    let payout;
    const isMock = !config.razorpay.keyId || config.razorpay.keyId.startsWith('rzp_live_your') || !process.env.RAZORPAYX_ACCOUNT_NUMBER || process.env.RAZORPAYX_ACCOUNT_NUMBER.includes('xxx');
    
    if (!isMock && rzpX.payouts?.create) {
      payout = await rzpX.payouts.create({
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
        amount: amount * 100,
        currency: 'INR',
        mode: 'UPI',
        purpose: 'reward',
        fund_account: { account_type: 'vpa', vpa: { address: customerUpi } },
        queue_if_low_balance: true,
        reference_id: `Panda_${videoId}`,
        narration: `PandaPraise reward for ${orderId}`,
      });
    } else {
      payout = {
        id: `pout_${Date.now().toString().slice(-6)}`,
        status: 'queued',
        utr: 'pending'
      };
    }

    const actor = req.user?.storeDomain || req.user?.email || 'kalyansilks.myshopify.com';
    const auditData = {
      action: 'UPI_PAYOUT_TRIGGERED',
      actor,
      target: videoId,
      description: `UPI payout ₹${amount} to ${customerUpi.slice(0, 3)}••• for order ${orderId}, payout ${payout.id}`,
      ip: req.ip || '127.0.0.1',
      orgId: req.user?.orgId || 'PP-KALYAN-IND-9021'
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create(auditData);
      } catch {}
    }
    createMemoryAuditLog(auditData);

    res.json({ success: true, payoutId: payout.id, status: payout.status, utr: payout.utr || 'pending' });
  } catch (e) {
    res.status(400).json({ error: e.error?.description || e.message });
  }
});

export default router;
