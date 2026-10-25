import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const router = express.Router();

// For demo - replace with real DB + 2FA verification
const ADMIN_EMAILS = ['admin@pandapraise.com', 'rajesh.k@kalyan.com'];

router.post('/admin/login', async (req, res) => {
  const { email, password, code } = req.body;
  // TODO: Verify password hash + TOTP code
  if (!ADMIN_EMAILS.includes(email)) return res.status(401).json({ error: 'Invalid admin' });
  if (password !== 'Panda@2026' || code !== '123456') return res.status(401).json({ error: 'Invalid 2FA' }); // CHANGE THIS
  
  const token = jwt.sign({ email, role: 'super_admin', orgId: config.orgId }, config.jwtSecret, { expiresIn: '8h' });
  res.json({ token, role: 'super_admin' });
});

export default router;
