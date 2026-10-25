import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  shop: { type: String, required: true, index: true },
  customerName: String,
  customerPhoneMasked: String, // +91 •• 8841
  orderId: String,
  orderNumber: String,
  productName: String,
  productPrice: Number,
  status: { 
    type: String, 
    enum: ['pending','auto-approved','ai-editing','ready','syncing','rejected'], 
    default: 'pending',
    index: true 
  },
  s3Url: String,
  rawDuration: String, // 0:28
  sentiment: Number, // 98
  transcript: String,
  quotation: String,
  hooks: [{ type: String }], // 3 hooks, first yellow
  ratios: {
    '9:16': String,
    '1:1': String,
    '4:5': String,
  },
  isVerifiedBuyer: { type: Boolean, default: true },
}, { timestamps: true });

export const Video = mongoose.model('Video', videoSchema);
