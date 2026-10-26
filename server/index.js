import express from 'express';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import shopifyRouter from './routes/shopify.js';
import billingRouter from './routes/billing.js';
import whatsappRouter from './routes/whatsapp.js';
import videosRouter from './routes/videos.js';

import metaAdsRouter from './routes/metaAds.js';
import payoutRouter from './routes/payout.js';

const app = express();

app.use(express.json());

// Mount routers
app.use('/auth', shopifyRouter);
app.use('/api/billing', billingRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/videos', videosRouter);
app.use('/api/video', videosRouter);
app.use('/api/meta', metaAdsRouter);
app.use('/api/payout', payoutRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', orgId: config.orgId, timestamp: new Date().toISOString() });
});

export { app };

const isDirectRun = process.argv[1]?.endsWith('server\\index.js') || process.argv[1]?.endsWith('server/index.js');
if (isDirectRun && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  if (process.env.AUTO_CONNECT_DB === 'true') {
    connectDB();
  }
  app.listen(PORT, () => {
    console.log(`PandaPraise backend server listening on port ${PORT}`);
  });
}
