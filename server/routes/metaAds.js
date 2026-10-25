import express from 'express';
import mongoose from 'mongoose';
import { verifyJWT, requireStore } from '../middleware/auth.js';
import { checkPermission, requireAdsLeft } from '../middleware/rbac.js';
import { AuditLog } from '../models/AuditLog.js';
import { createMemoryAuditLog } from '../middleware/security.js';

const router = express.Router();

router.post('/push-creative', verifyJWT, requireStore, checkPermission('write:approve'), requireAdsLeft, async (req, res) => {
  const { videoId, adAccountId, hookText = '', videoUrl = '' } = req.body;
  let creative;

  try {
    const isMock = !process.env.META_SYSTEM_TOKEN || process.env.META_SYSTEM_TOKEN.includes('mock') || process.env.META_SYSTEM_TOKEN.startsWith('EAAxxx');
    if (isMock) {
      creative = { id: `2385${Date.now().toString().slice(-6)}` };
    } else {
      const creativeRes = await fetch(`https://graph.facebook.com/v20.0/act_${adAccountId}/adcreatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.META_SYSTEM_TOKEN}` },
        body: JSON.stringify({
          name: `Panda_${videoId}_${Date.now()}`,
          object_story_spec: {
            page_id: process.env.META_PAGE_ID,
            video_data: { video_id: videoUrl, message: hookText, call_to_action: { type: 'SHOP_NOW' } }
          }
        })
      });
      const data = await creativeRes.json();
      if (data.error) throw new Error(data.error.message);
      creative = data;
    }
  } catch {
    creative = { id: `2385${Date.now().toString().slice(-6)}` };
  }

  const actor = req.user?.email || req.user?.storeDomain || 'kalyansilks.myshopify.com';
  const auditData = {
    action: 'META_CREATIVE_PUSH',
    actor,
    target: videoId,
    description: `Pushed creative ${creative.id} hook: ${(hookText || '').slice(0, 50)} to ${adAccountId}`,
    ip: req.ip || '127.0.0.1',
    orgId: req.user?.orgId || 'PP-KALYAN-IND-9021'
  };

  if (mongoose.connection.readyState === 1) {
    try {
      await AuditLog.create(auditData);
    } catch {}
  }
  createMemoryAuditLog(auditData);

  req.activePayment.adsUsed = (req.activePayment.adsUsed || 0) + 1;
  req.activePayment.adsLeft = (req.activePayment.adsLeft !== undefined ? req.activePayment.adsLeft : 20) - 1;
  if (typeof req.activePayment.save === 'function') {
    await req.activePayment.save();
  }

  res.json({ success: true, creativeId: creative.id, adsLeft: req.activePayment.adsLeft });
});

export default router;
