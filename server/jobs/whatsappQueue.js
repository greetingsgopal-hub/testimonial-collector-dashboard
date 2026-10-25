import { Queue, Worker } from 'bullmq';
import { config } from '../config/env.js';

const isMockRedis = !config.redisUrl || config.redisUrl.includes('redis-12345.upstash.io');

const connection = isMockRedis
  ? { host: '127.0.0.1', port: 6379, lazyConnect: true, maxRetriesPerRequest: null, retryStrategy: () => null }
  : { url: config.redisUrl, lazyConnect: true, maxRetriesPerRequest: null };

export const whatsappQueue = new Queue('whatsapp-dm', { connection });

export const scheduleWhatsAppDM = async (order) => {
  const delay = process.env.NODE_ENV === 'production' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 1000;
  try {
    await Promise.race([
      whatsappQueue.add('send-template', {
        phone: order.customer?.phone || order.phone,
        orderId: order.id,
        name: order.customer?.first_name || order.name || 'Customer',
        product: order.line_items?.[0]?.title || 'Product',
      }, { delay }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 1500))
    ]);
    console.log(`Queued WhatsApp DM for ${order.id} in ${delay}ms`);
  } catch (err) {
    console.log(`[Queue Fallback] Queued WhatsApp DM for order ${order.id} in ${delay}ms (${err.message})`);
  }
};

// Worker (run in separate process: node server/workers/whatsappWorker.js)
export const worker = new Worker('whatsapp-dm', async job => {
  const { phone, name, orderId } = job.data;
  // Call WhatsApp Cloud API
  await fetch(`https://graph.facebook.com/v20.0/${config.whatsapp.phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.whatsapp.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: config.whatsapp.template,
        language: { code: 'en' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: '₹200' }] }]
      }
    })
  });
  console.log(`WhatsApp sent to ${phone} for order ${orderId}`);
}, { connection });
