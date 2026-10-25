import jwt from 'jsonwebtoken';
import { server } from '../server/server.js';
import { config } from '../server/config/env.js';

async function runTests() {
  console.log('--- STARTING PHASE 9 VIDEO PIPELINE E2E TESTS ---');

  const baseUrl = 'http://localhost:3000';
  const adminToken = jwt.sign(
    { email: 'admin@pandapraise.com', role: 'super_admin', orgId: config.orgId },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
  const merchantToken = jwt.sign(
    { email: 'merchant@kalyan.com', role: 'merchant_admin', storeDomain: 'kalyansilks.myshopify.com', orgId: config.orgId },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  // 1. Simulate Shopify fulfilled order -> schedule DM
  console.log('\n[1] Testing WhatsApp send-template:');
  const res1 = await fetch(`${baseUrl}/api/whatsapp/send-template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: '919999999999', name: 'Ananya', orderId: 'KAL-2341' })
  });
  const data1 = await res1.json();
  console.log('Status 1:', res1.status, data1);
  if (!data1.messageId || !data1.success) throw new Error('Step 1 failed');

  // 2. Simulate customer replies video (incoming webhook)
  console.log('\n[2] Testing incoming customer video webhook:');
  const res2 = await fetch(`${baseUrl}/api/whatsapp/webhook/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '919999999999',
              type: 'video',
              video: { id: 'vid_test_12345' }
            }]
          }
        }]
      }]
    })
  });
  console.log('Status 2:', res2.status);
  if (res2.status !== 200) throw new Error('Step 2 failed');

  const videoId = 'vid_test_12345';

  // 3. Admin updates status to ai-editing & approves
  console.log('\n[3a] Testing admin patch status to ai-editing:');
  const res3a = await fetch(`${baseUrl}/api/videos/${videoId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'ai-editing' })
  });
  const data3a = await res3a.json();
  console.log('Status 3a:', res3a.status, 'Video status:', data3a.status);
  if (data3a.status !== 'ai-editing') throw new Error('Step 3a status update failed');

  console.log('\n[3b] Testing admin approve video (Panda AI hook generation):');
  const res3b = await fetch(`${baseUrl}/api/videos/${videoId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  const data3b = await res3b.json();
  console.log('Status 3b:', res3b.status, 'Hooks:', data3b.hooks, 'Ratios:', Object.keys(data3b.ratios || {}));
  if (data3b.status !== 'ready' || !data3b.hooks || data3b.hooks.length !== 3) {
    throw new Error('Step 3b approval failed');
  }

  // 4. Merchant sees in inbox
  console.log('\n[4] Testing merchant inbox:');
  const res4 = await fetch(`${baseUrl}/api/videos/inbox?shop=kalyansilks.myshopify.com`, {
    headers: { Authorization: `Bearer ${merchantToken}` }
  });
  const data4 = await res4.json();
  console.log('Status 4:', res4.status, 'newCount:', data4.newCount, 'total videos:', data4.videos?.length);
  const approvedVideo = data4.videos?.find(v => (v._id === videoId || v.id === videoId));
  console.log('Approved video found:', approvedVideo?.status, 'ratios:', approvedVideo?.ratios);
  if (data4.newCount !== 3 || !approvedVideo || approvedVideo.status !== 'ready') {
    throw new Error('Step 4 inbox verification failed');
  }

  // 5. Merchant downloads - decrement ads
  console.log('\n[5] Testing merchant download with ads decrement:');
  const res5 = await fetch(`${baseUrl}/api/videos/${videoId}/download`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${merchantToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ratio: '9:16' })
  });
  const data5 = await res5.json();
  console.log('Status 5:', res5.status, data5);
  if (!data5.url || data5.adsLeft !== 19) {
    throw new Error(`Step 5 download failed, expected adsLeft 19 but got ${data5.adsLeft}`);
  }

  console.log('\n=== ALL PHASE 9 VERIFICATION CHECKS PASSED ===\n');

  // Close server cleanly
  await new Promise(resolve => server.close(resolve));
  console.log('Server cleanly closed.');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
