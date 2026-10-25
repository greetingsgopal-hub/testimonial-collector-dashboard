import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true, index: true }, // your-store.myshopify.com
  accessToken: { type: String, required: true },
  scopes: { type: String, default: 'read_orders,read_customers' },
  installedAt: { type: Date, default: Date.now },
  plan: { type: String, enum: ['free','starter','growth','scale'], default: 'free' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Shop = mongoose.model('Shop', shopSchema);
