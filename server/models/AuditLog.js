import mongoose from 'mongoose';
import crypto from 'crypto';

const auditSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['RBAC_ROLE_CHANGE','UPI_PAYOUT_TRIGGERED','META_CREATIVE_PUSH','UGC_DISMISSED','CHANNEL_SYNC_CONFIG','IMPERSONATE','BILLING_PURCHASE','AD_DOWNLOAD']
  },
  actor: { type: String, required: true }, // email or system
  target: String, // shop or video id
  description: String,
  ip: String,
  orgId: { type: String, default: 'PP-KALYAN-IND-9021' },
  hash: String, // sha256 for immutability
}, { timestamps: true });

auditSchema.pre('save', function(next) {
  const data = `${this.action}${this.actor}${this.target}${Date.now()}`;
  this.hash = crypto.createHash('sha256').update(data).digest('hex').substring(0,16);
  next();
});

export const AuditLog = mongoose.model('AuditLog', auditSchema);
