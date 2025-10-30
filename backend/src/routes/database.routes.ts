import express from 'express';
import { getDatabaseHealth, getSalesStatistics } from '../controllers/database.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, authorize(['admin']));

// GET /api/database/health - Get database health and index statistics
router.get('/health', getDatabaseHealth);

// GET /api/database/sales-stats - Get sales statistics
router.get('/sales-stats', getSalesStatistics);

export default router;
