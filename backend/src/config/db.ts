import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';


export async function connectDB() {
try {
mongoose.set('strictQuery', true);
await mongoose.connect(env.mongoUri);
logger.info('✅ MongoDB connected');
} catch (err) {
logger.error('❌ MongoDB connection error', err);
process.exit(1);
}
}