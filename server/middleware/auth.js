import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuditLog } from '../models/AuditLog.js';

export const verifyJWT = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, role, storeDomain, orgId }
    
    // Impersonation check
    if (req.query.impersonate) {
      if (decoded.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super_admin can impersonate' });
      }
      req.user.impersonatedStore = req.query.impersonate;
      AuditLog.create({
        action: 'IMPERSONATE',
        actor: decoded.email,
        target: req.query.impersonate,
        ip: req.ip,
        description: `Impersonating ${req.query.impersonate}`
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Requires ${roles.join(',')}` });
  }
  next();
};

export const requireStore = (req, res, next) => {
  const store = req.query.shop || req.params.shop || req.body?.shop || req.user.storeDomain;
  const effectiveStore = req.user.impersonatedStore || req.user.storeDomain;
  if (req.user.role === 'super_admin') return next();
  if (store && store !== effectiveStore && req.query.shop !== effectiveStore) {
    // Allow if querying own store
    if (req.user.storeDomain !== store && req.user.impersonatedStore !== store) {
      return res.status(403).json({ error: 'Store mismatch' });
    }
  }
  req.effectiveStore = effectiveStore;
  next();
};
