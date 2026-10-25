import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { AuditLog } from '../models/AuditLog.js';

export const memoryAuditLogs = [];

export const createMemoryAuditLog = (data) => {
  const timestamp = new Date();
  const rawData = `${data.action}${data.actor}${data.target}${timestamp.getTime()}`;
  const hash = crypto.createHash('sha256').update(rawData).digest('hex').substring(0, 16);
  const doc = {
    ...data,
    hash,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString()
  };
  memoryAuditLogs.unshift(doc);
  return doc;
};

export const securityMiddleware = [
  helmet({ contentSecurityPolicy: false }),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } }),
];

export const audit = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 400) {
      try {
        const actor = req.user?.storeDomain || req.user?.email || 'system';
        const target = req.params?.id || req.effectiveStore || req.query?.shop || '';
        const orgId = req.user?.orgId || 'PP-KALYAN-IND-9021';
        const description = `${action} by ${actor} - ${JSON.stringify(body).slice(0, 200)}`;
        const ip = req.ip || '127.0.0.1';

        const logData = {
          action,
          actor,
          target,
          description,
          ip,
          orgId
        };

        if (mongoose.connection.readyState === 1) {
          AuditLog.create(logData).catch(() => {});
        }
        createMemoryAuditLog(logData);
      } catch {}
    }
    return originalJson(body);
  };
  next();
};

export const requireMFA = (req, res, next) => {
  if (req.user?.role === 'super_admin' && !req.headers['x-mfa-verified']) {
    // For prod: verify TOTP header
    // if (!verifyTOTP(req.headers['x-mfa-code'])) return 403
  }
  next();
};

export const logRead = async (req, res, next) => {
  // Log every admin access to audit
  if (req.user?.role === 'super_admin') {
    const actor = req.user.email;
    const target = req.query.impersonate || req.effectiveStore || '';
    const logData = {
      action: req.query.impersonate ? 'IMPERSONATE' : 'AD_DOWNLOAD',
      actor,
      target,
      ip: req.ip || '127.0.0.1',
      description: `${req.method} ${req.path} - ${JSON.stringify(req.query).slice(0, 100)}`,
      orgId: req.user.orgId || 'PP-KALYAN-IND-9021'
    };
    if (mongoose.connection.readyState === 1) {
      AuditLog.create(logData).catch(() => {});
    }
    createMemoryAuditLog(logData);
  }
  next();
};
