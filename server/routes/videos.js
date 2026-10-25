import express from 'express';
import mongoose from 'mongoose';
import { verifyJWT, requireStore } from '../middleware/auth.js';
import { Video } from '../models/Video.js';
import { checkPermission, requireAdsLeft } from '../middleware/rbac.js';
import { generateHooks } from '../services/pandaAI.js';

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback if MongoDB connection is not active
export const memoryVideos = new Map();

// Seed initial memory videos matching merchant test scenario
const seedMemoryVideos = () => {
  if (memoryVideos.size > 0) return;
  const initial = [
    {
      _id: '65f1a2b3c4d5e6f7a8b9c001',
      id: '65f1a2b3c4d5e6f7a8b9c001',
      shop: 'kalyansilks.myshopify.com',
      customerName: 'Priya Sundaram',
      customerPhoneMasked: '+91 •• 8841',
      productName: 'Chanderi Anarkali Kurta Set',
      orderId: 'KS-89104',
      status: 'pending',
      s3Url: 'https://s3.pandapraise.com/raw/priya.mp4',
      rawDuration: '0:28',
      transcript: 'Honestly shocked by the pocket depth! Material is pure luxury.',
      createdAt: new Date(Date.now() - 3600000 * 2)
    },
    {
      _id: '65f1a2b3c4d5e6f7a8b9c002',
      id: '65f1a2b3c4d5e6f7a8b9c002',
      shop: 'kalyansilks.myshopify.com',
      customerName: 'Arjun Nair',
      customerPhoneMasked: '+91 •• 4912',
      productName: 'Raw Silk Nehru Jacket',
      orderId: 'KS-89022',
      status: 'pending',
      s3Url: 'https://s3.pandapraise.com/raw/arjun.mp4',
      rawDuration: '0:35',
      transcript: 'The zari stitching is immaculate. Looks and feels premium.',
      createdAt: new Date(Date.now() - 3600000 * 5)
    },
    {
      _id: '65f1a2b3c4d5e6f7a8b9c003',
      id: '65f1a2b3c4d5e6f7a8b9c003',
      shop: 'kalyansilks.myshopify.com',
      customerName: 'Meera Kapoor',
      customerPhoneMasked: '+91 •• 7732',
      productName: 'Mul Cotton Saree - Indigo Dabu',
      orderId: 'KS-88971',
      status: 'pending',
      s3Url: 'https://s3.pandapraise.com/raw/meera.mp4',
      rawDuration: '0:19',
      transcript: 'The indigo did not bleed even after first wash. Super light.',
      createdAt: new Date(Date.now() - 3600000 * 9)
    }
  ];
  for (const v of initial) {
    const doc = createMemoryDoc(v);
    memoryVideos.set(String(doc._id), doc);
  }
};

const createMemoryDoc = (data) => {
  const doc = {
    ...data,
    _id: data._id || `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: data.createdAt || new Date(),
    save: async function () {
      memoryVideos.set(String(this._id), this);
      return this;
    }
  };
  return doc;
};

seedMemoryVideos();

export const createMemoryVideo = (data, customId) => {
  seedMemoryVideos();
  const id = customId ? String(customId) : `vid_${Date.now()}`;
  const doc = createMemoryDoc({ _id: id, id, ...data });
  memoryVideos.set(id, doc);
  return doc;
};

export const findMemoryVideo = (id) => {
  seedMemoryVideos();
  return memoryVideos.get(String(id)) || Array.from(memoryVideos.values()).find(v => String(v._id) === String(id) || String(v.id) === String(id));
};

export const updateMemoryVideo = (id, updates) => {
  seedMemoryVideos();
  const doc = findMemoryVideo(id);
  if (doc) {
    Object.assign(doc, updates);
    memoryVideos.set(String(doc._id), doc);
    return doc;
  }
  const created = createMemoryDoc({ _id: id, id, ...updates });
  memoryVideos.set(String(id), created);
  return created;
};

// Merchant inbox
router.get('/inbox', verifyJWT, requireStore, async (req, res) => {
  const shop = req.effectiveStore || req.query.shop || 'kalyansilks.myshopify.com';
  let videos = [];
  if (isDbConnected()) {
    try {
      videos = await Video.find({ shop }).sort({ createdAt: -1 });
    } catch {}
  }
  if (!videos || videos.length === 0) {
    seedMemoryVideos();
    videos = Array.from(memoryVideos.values()).filter(v => !v.shop || v.shop === shop);
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  res.json({ videos, newCount: videos.filter(v => v.status === 'pending').length });
});

// Admin pipeline
router.get('/admin/pipeline', verifyJWT, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Admin only' });
  let videos = [];
  if (isDbConnected()) {
    try {
      videos = await Video.find({}).sort({ createdAt: -1 });
    } catch {}
  }
  if (!videos || videos.length === 0) {
    seedMemoryVideos();
    videos = Array.from(memoryVideos.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  res.json({ videos });
});

// Status update
router.patch('/:id/status', verifyJWT, async (req, res) => {
  const { status } = req.body; // pending -> in-edit -> ready -> etc
  let video;
  if (isDbConnected()) {
    try {
      video = await Video.findByIdAndUpdate(req.params.id, { status }, { new: true });
    } catch {}
  }
  if (!video) {
    video = updateMemoryVideo(req.params.id, { status });
  }
  res.json(video);
});

// Approve & generate hooks + download (Panda AI mock)
router.post('/:id/approve', verifyJWT, requireStore, checkPermission('write:approve'), async (req, res) => {
  let video;
  if (isDbConnected()) {
    try {
      video = await Video.findById(req.params.id);
    } catch {}
  }
  if (!video) {
    video = findMemoryVideo(req.params.id);
  }
  if (!video) return res.status(404).json({ error: 'Not found' });
  
  // Mock Panda AI: auto-generate 3 hooks + captions
  const generatedHooks = await generateHooks(video.transcript || '', video.productName || 'product');
  video.hooks = generatedHooks && generatedHooks.length ? generatedHooks : [
    `The only ${video.productName || 'product'} you will ever need`,
    `I was skeptical but this changed everything`,
    `${video.customerName || 'Customer'} tried this - results are insane`
  ];
  video.ratios = {
    '9:16': `https://s3.pandapraise.com/${video._id}/9x16.mp4`,
    '1:1': `https://s3.pandapraise.com/${video._id}/1x1.mp4`,
    '4:5': `https://s3.pandapraise.com/${video._id}/4x5.mp4`,
  };
  video.status = 'ready';
  if (typeof video.save === 'function') {
    await video.save();
  } else {
    updateMemoryVideo(req.params.id, video);
  }
  res.json(video);
});

// Download - decrement ads
router.post('/:id/download', verifyJWT, requireStore, requireAdsLeft, async (req, res) => {
  const { ratio = '9:16' } = req.body;
  let video;
  if (isDbConnected()) {
    try {
      video = await Video.findById(req.params.id);
    } catch {}
  }
  if (!video) {
    video = findMemoryVideo(req.params.id);
  }
  if (!video) {
    video = createMemoryVideo({
      _id: req.params.id,
      id: req.params.id,
      status: 'ready',
      ratios: {
        '9:16': `https://s3.pandapraise.com/${req.params.id}/9x16.mp4`,
        '1:1': `https://s3.pandapraise.com/${req.params.id}/1x1.mp4`,
        '4:5': `https://s3.pandapraise.com/${req.params.id}/4x5.mp4`
      }
    }, req.params.id);
  }

  req.activePayment.adsUsed = (req.activePayment.adsUsed || 0) + 1;
  req.activePayment.adsLeft = (req.activePayment.adsLeft !== undefined ? req.activePayment.adsLeft : 20) - 1;
  if (typeof req.activePayment.save === 'function') {
    await req.activePayment.save();
  }
  const url = (video.ratios && video.ratios[ratio]) || `https://s3.pandapraise.com/${video._id}/${ratio.replace(':', 'x')}.mp4`;
  res.json({ url, adsLeft: req.activePayment.adsLeft });
});

export default router;
