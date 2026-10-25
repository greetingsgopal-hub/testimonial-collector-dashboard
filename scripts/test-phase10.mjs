import jwt from 'jsonwebtoken';
import { server } from '../server/server.js';
import { config } from '../server/config/env.js';

async function runTests() {
  console.log('--- STARTING PHASE 10 SECURITY & AUDIT TESTS ---');

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

  // 1. Security headers check (Helmet)
  console.log('\n[1] Checking Helmet Security Headers on /api/health:');
  const resHeaders = await fetch(`${baseUrl}/api/health`);
  console.log('x-content-type-options:', resHeaders.headers.get('x-content-type-options'));
  console.log('x-frame-options:', resHeaders.headers.get('x-frame-options'));
  if (!resHeaders.headers.get('x-content-type-options')) {
    throw new Error('Helmet headers missing');
  }

  // 2. Audit log creation on Ad Download
  console.log('\n[2] Testing Audit Log creation on POST /api/videos/xxx/download:');
  const resDownload = await fetch(`${baseUrl}/api/videos/xxx/download`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${merchantToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ratio: '9:16' })
  });
  console.log('Download status:', resDownload.status);
  const downloadBody = await resDownload.json();
  console.log('Download response:', downloadBody);

  // Check audit log list
  const resAudit = await fetch(`${baseUrl}/api/audit`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('Audit status:', resAudit.status);
  const auditData = await resAudit.json();
  console.log('Audit log count:', auditData.logs?.length);
  const downloadLog = auditData.logs?.find(l => l.action === 'AD_DOWNLOAD' && l.target === 'xxx');
  console.log('Matched log entry:', downloadLog);
  if (!downloadLog) {
    throw new Error('Audit log for AD_DOWNLOAD not found');
  }

  // 3. Immutability & Hash check (16-char sha256 substring)
  console.log('\n[3] Checking Audit Log Hash Immutability:');
  console.log('Hash:', downloadLog.hash, 'Length:', downloadLog.hash?.length);
  console.log('Timestamp:', downloadLog.createdAt);
  if (!downloadLog.hash || downloadLog.hash.length !== 16 || !downloadLog.createdAt) {
    throw new Error('Hash or timestamp invalid');
  }

  // 4. CSV Export test
  console.log('\n[4] Testing GET /api/audit/export:');
  const resExport = await fetch(`${baseUrl}/api/audit/export`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const csvText = await resExport.text();
  console.log('CSV Content-Type:', resExport.headers.get('content-type'));
  console.log('CSV Preview (first 2 lines):\n' + csvText.split('\n').slice(0, 2).join('\n'));
  if (!csvText.startsWith('timestamp,action,actor,target,hash')) {
    throw new Error('CSV export format mismatch');
  }

  // 5. MFA & Org Isolation check
  console.log('\n[5] Testing Org isolation on /api/admin/team:');
  const otherOrgToken = jwt.sign(
    { email: 'other@other.com', role: 'super_admin', orgId: 'PP-OTHER' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
  const resTeamOther = await fetch(`${baseUrl}/api/admin/team`, {
    headers: { Authorization: `Bearer ${otherOrgToken}` }
  });
  const teamOtherData = await resTeamOther.json();
  console.log('Other org team response:', teamOtherData);
  if (teamOtherData.org !== 'PP-OTHER') {
    throw new Error(`Expected org PP-OTHER but got ${teamOtherData.org}`);
  }

  const resTeamKalyan = await fetch(`${baseUrl}/api/admin/team`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const teamKalyanData = await resTeamKalyan.json();
  console.log('Kalyan org team response:', teamKalyanData);
  if (teamKalyanData.org !== 'PP-KALYAN-IND-9021') {
    throw new Error(`Expected org PP-KALYAN-IND-9021 but got ${teamKalyanData.org}`);
  }

  // 6. Rate limit test
  console.log('\n[6] Testing Rate Limiting (100 req limit):');
  let hitRateLimit = false;
  let requestsMade = 0;
  for (let i = 0; i < 110; i++) {
    const res = await fetch(`${baseUrl}/api/health`);
    requestsMade++;
    if (res.status === 429) {
      hitRateLimit = true;
      const rateLimitBody = await res.json();
      console.log(`Request #${requestsMade} returned 429:`, rateLimitBody);
      break;
    }
  }
  if (!hitRateLimit) {
    throw new Error('Rate limit was not triggered after 110 requests');
  }

  console.log('\n=== ALL PHASE 10 SECURITY & AUDIT CHECKS PASSED ===\n');

  await new Promise(resolve => server.close(resolve));
  console.log('Server cleanly closed.');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
