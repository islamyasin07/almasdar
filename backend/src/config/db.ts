import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { initializeIndexes } from './indexes.js';


export async function connectDB() {
try {
mongoose.set('strictQuery', true);
await mongoose.connect(env.mongoUri);
logger.info('✅ MongoDB connected');

// Initialize database indexes
await initializeIndexes();
} catch (err) {
logger.error('❌ MongoDB connection error', err);
process.exit(1);
}
}