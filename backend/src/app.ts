import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter, productLimiter } from './middleware/rateLimit.middleware.js';


const app = express();
app.use(helmet());
// Support multiple comma-separated origins in CORS_ORIGIN
const allowedOrigins = (env.corsOrigin || '')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : undefined }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

// Apply general rate limiting to all routes
app.use('/api', apiLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static(env.uploadDir));

// Routes with specific rate limits
app.use('/api', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productLimiter, productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);


app.use(notFound);
app.use(errorHandler);


export default app;