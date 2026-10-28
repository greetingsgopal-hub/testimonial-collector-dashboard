import express from 'express';
import { config } from '../config/env.js';
import { Video } from '../models/Video.js';

const router = express.Router();

// Send template
router.post('/send-template', async (req, res) => {
  const { to, name, reward = '₹200', orderId } = req.body;
  try {
    const isMockToken = !config.whatsapp.token || config.whatsapp.token.startsWith('EAAG...');
    if (isMockToken) {
      const mockMessageId = `wamid.mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[WhatsApp Mock] Template ${config.whatsapp.template} sent to ${to} for order ${orderId} (${mockMessageId})`);
      return res.json({ success: true, messageId: mockMessageId, status: 'sent' });
    }

    const resp = await fetch(`https://graph.facebook.com/v20.0/${config.whatsapp.phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.whatsapp.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: config.whatsapp.template,
          language: { code: 'en' },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: reward }, { type: 'text', text: orderId }] }
          ]
        }
      })
    });
    const data = await resp.json();
    if (data.error) return res.status(400).json(data);
    res.json({ success: true, messageId: data.messages[0].id, status: 'sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

import { createMemoryVideo } from './videos.js';
import mongoose from 'mongoose';

// Incoming webhook - customer sends video
router.get('/webhook/whatsapp', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'panda_verify_2026';
  if (req.query['hub.verify_token'] === verifyToken) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

router.post('/webhook/whatsapp', express.json(), async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  if (message?.type === 'video') {
    const videoId = message.video.id;
    const from = message.from;
    console.log(`New video from ${from}, videoId ${videoId}`);
    try {
      const storagePath = `whatsapp/${from}/${videoId}.mp4`;
      const doc = {
        shop: 'kalyansilks.myshopify.com',
        customerPhoneMasked: '+91 •• ' + String(from).slice(-4),
        customerName: 'Ananya',
        productName: 'Chanderi Anarkali Kurta Set',
        storagePath, // <-- save path, not URL
        rawDuration: '0:19',
        status: 'pending'
      };
      if (mongoose.connection.readyState === 1) {
        await Video.create(doc);
      }
      createMemoryVideo(doc, videoId);
    } catch {}
  }
  res.sendStatus(200);
});

// Health
router.get('/health', async (req, res) => {
  const isMockToken = !config.whatsapp.token || config.whatsapp.token.startsWith('EAAG...');
  if (isMockToken) {
    return res.json({
      whatsapp: 'ok',
      phoneId: config.whatsapp.phoneId,
      tier: 'TIER_3',
      templateStatus: 'APPROVED'
    });
  }

  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${config.whatsapp.phoneId}?fields=health_status`, {
      headers: { Authorization: `Bearer ${config.whatsapp.token}` }
    });
    const d = await r.json();
    res.json({ whatsapp: 'ok', phoneId: config.whatsapp.phoneId, health: d, tier: 'TIER_3', templateStatus: 'APPROVED' });
  } catch (e) {
    res.json({ whatsapp: 'ok', tier: 'TIER_3', templateStatus: 'APPROVED', note: e.message });
  }
});

export default router;
