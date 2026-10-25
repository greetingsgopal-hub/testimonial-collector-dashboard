import express from 'express';
import mongoose from 'mongoose';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';
import { memoryAuditLogs } from '../middleware/security.js';

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', verifyJWT, requireRole(['super_admin']), async (req, res) => {
  let logs = [];
  if (isDbConnected()) {
    try {
      logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    } catch {}
  }
  if (!logs || logs.length === 0) {
    logs = memoryAuditLogs.slice(0, 100);
  }
  res.json({ logs });
});

router.get('/export', verifyJWT, requireRole(['super_admin']), async (req, res) => {
  let logs = [];
  if (isDbConnected()) {
    try {
      logs = await AuditLog.find({}).sort({ createdAt: -1 });
    } catch {}
  }
  if (!logs || logs.length === 0) {
    logs = memoryAuditLogs;
  }
  const csv = 'timestamp,action,actor,target,hash\n' + logs.map(l => `${l.createdAt},${l.action},${l.actor},${l.target},${l.hash}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

export default router;
