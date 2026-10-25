import jwt from 'jsonwebtoken';
import { server } from '../server/server.js';
import { config } from '../server/config/env.js';

async function runTests() {
  console.log('--- STARTING PHASE 12 META ADS PUSH & UPI PAYOUT TESTS ---');

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

  // 1. Test Meta Push Creative
  console.log('\n[1] Testing POST /api/meta/push-creative:');
  const resMeta = await fetch(`${baseUrl}/api/meta/push-creative`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${merchantToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      videoId: '665xxx',
      adAccountId: '123456789',
      hookText: 'The only saree you will ever need',
      videoUrl: 'https://s3.pandapraise.com/665xxx/9x16.mp4'
    })
  });
  const metaData = await resMeta.json();
  console.log('Meta Push Status:', resMeta.status, metaData);
  if (!metaData.success || !metaData.creativeId?.startsWith('2385')) {
    throw new Error('Meta Push creative failed');
  }

  // 2. Test UPI Payout via RazorpayX
  console.log('\n[2] Testing POST /api/payout/trigger-upi:');
  const resUpi = await fetch(`${baseUrl}/api/payout/trigger-upi`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${merchantToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerUpi: 'test@okaxis',
      amount: 200,
      videoId: '665xxx',
      orderId: 'KAL-2341'
    })
  });
  const upiData = await resUpi.json();
  console.log('UPI Payout Status:', resUpi.status, upiData);
  if (!upiData.success || !upiData.payoutId?.startsWith('pout_') || upiData.status !== 'queued') {
    throw new Error('UPI Payout trigger failed');
  }

  // 3. Check Audit Logs for both events
  console.log('\n[3] Checking Audit Log for META_CREATIVE_PUSH and UPI_PAYOUT_TRIGGERED:');
  const resAudit = await fetch(`${baseUrl}/api/audit`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const auditData = await resAudit.json();
  console.log('Audit logs returned:', auditData.logs?.length);
  const metaLog = auditData.logs?.find(l => l.action === 'META_CREATIVE_PUSH' && l.target === '665xxx');
  const upiLog = auditData.logs?.find(l => l.action === 'UPI_PAYOUT_TRIGGERED' && l.target === '665xxx');

  console.log('Meta creative push log:', metaLog ? `Found (hash: ${metaLog.hash})` : 'NOT FOUND');
  console.log('UPI payout log:', upiLog ? `Found (hash: ${upiLog.hash})` : 'NOT FOUND');

  if (!metaLog || !upiLog || !metaLog.hash || !upiLog.hash) {
    throw new Error('Audit logs missing for Phase 12 events');
  }

  // 4. Final System Health Check
  console.log('\n[4] Running Final Full Health Check:');
  const resHealth = await fetch(`${baseUrl}/api/health`);
  const healthData = await resHealth.json();
  console.log('Health Status:', resHealth.status, healthData);
  if (
    healthData.shopify !== 'ok' ||
    healthData.razorpay !== 'ok' ||
    healthData.whatsapp !== 'ok' ||
    healthData.meta !== 'ok' ||
    healthData.upi !== 'ok'
  ) {
    throw new Error('Full health check failed');
  }

  console.log('\n=== ALL PHASE 12 META ADS PUSH & UPI PAYOUT CHECKS PASSED ===\n');

  await new Promise(resolve => server.close(resolve));
  console.log('Server cleanly closed.');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
