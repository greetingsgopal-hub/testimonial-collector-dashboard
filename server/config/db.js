import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    if (process.env.EXIT_ON_DB_FAIL === 'true') {
      process.exit(1);
    }
    throw err;
  }
};
