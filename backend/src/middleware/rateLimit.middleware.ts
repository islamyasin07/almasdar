import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Stricter limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: { message: 'Too many login attempts, please try again later' }
});

// Product creation/update limiter for admin/staff
export const productLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.nodeEnv === 'production' ? 100 : 300 // limit product operations
});