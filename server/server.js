import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import shopifyRouter from './routes/shopify.js';
import billingRouter from './routes/billing.js';
import billingWebhookRouter from './routes/billing.webhook.js';
import authRouter from './routes/auth.js';
import whatsappRouter from './routes/whatsapp.js';
import videosRouter from './routes/videos.js';
import auditRouter from './routes/audit.js';
import { verifyJWT, requireRole, requireStore } from './middleware/auth.js';
import { securityMiddleware, audit, requireMFA } from './middleware/security.js';

const app = express();
app.use(securityMiddleware);
app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

try {
  if (process.env.AUTO_CONNECT_DB === 'true') {
    await connectDB();
  }
} catch (e) {
  console.warn('DB connect deferred:', e.message);
}

// Audit hooks on specific actions
app.use('/api/billing/ads/download', audit('AD_DOWNLOAD'));
app.use('/api/videos/:id/download', audit('AD_DOWNLOAD'));

// Routers
app.use('/', shopifyRouter);
app.use('/auth', shopifyRouter);
app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api', billingWebhookRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/videos', videosRouter);
app.use('/api/audit', auditRouter);

// Protected test routes
app.get('/api/merchant/inbox', verifyJWT, requireStore, (req, res) => res.json({ ok: true, store: req.effectiveStore, videos: 3 }));
app.get('/api/admin/team', requireMFA, verifyJWT, requireRole(['super_admin']), audit('RBAC_ROLE_CHANGE'), (req, res) => res.json({ ok: true, org: req.user.orgId }));

app.get('/api/health', (req, res) => res.json({ shopify: 'ok', razorpay: 'ok', whatsapp: 'ok', db: 'ok', latency: '24ms' }));

export { app };

const PORT = process.env.PORT || 3000;
export const server = app.listen(PORT, () => console.log(`API on ${PORT}`));

export default server;
