import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  shop: { type: String, required: true, index: true },
  drop: { type: String, enum: ['starter','growth','scale'], required: true },
  amount: { type: Number, required: true }, // 1500, 2999, 6999
  adsTotal: { type: Number, required: true }, // 5, 20, 50
  adsUsed: { type: Number, default: 0 },
  adsLeft: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['created','paid','failed'], default: 'created' },
  validUntil: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) }, // 30 days
}, { timestamps: true });

paymentSchema.index({ shop: 1, status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
