import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';

const router = Router();

// All admin routes require admin/staff authentication
router.use(authenticate);
router.use(authorize(['admin', 'staff']));

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lt: 10 }, status: 'active' }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'email profile')
    ]);

    res.json({
      statistics: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        lowStockProducts
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch dashboard data' 
    });
  }
});

// Sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const matchStage: any = { paymentStatus: 'paid' };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    let groupByFormat = '%Y-%m-%d';
    if (groupBy === 'month') groupByFormat = '%Y-%m';
    if (groupBy === 'year') groupByFormat = '%Y';

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch sales report' 
    });
  }
});

// Product performance
router.get('/products/performance', async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch product performance' 
    });
  }
});

// Customer analytics
router.get('/customers/analytics', async (req, res) => {
  try {
    const [
      topCustomers,
      customersByMonth
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$customer',
            totalSpent: { $sum: '$total' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' }
      ]),
      User.aggregate([
        { $match: { role: 'customer' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      topCustomers,
      customersByMonth
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch customer analytics' 
    });
  }
});

// Inventory report
router.get('/inventory', async (req, res) => {
  try {
    const [
      lowStock,
      outOfStock,
      totalValue
    ] = await Promise.all([
      Product.find({ stock: { $lt: 10, $gt: 0 }, status: 'active' })
        .select('name sku stock price')
        .sort({ stock: 1 }),
      Product.find({ stock: 0, status: 'out_of_stock' })
        .select('name sku stock price'),
      Product.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            totalItems: { $sum: '$stock' }
          }
        }
      ])
    ]);

    res.json({
      lowStock,
      outOfStock,
      totalValue: totalValue[0]?.totalValue || 0,
      totalItems: totalValue[0]?.totalItems || 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch inventory report' 
    });
  }
});

// Reviews analytics
router.get('/reviews/analytics', async (req, res) => {
  try {
    const [
      averageRating,
      ratingDistribution,
      recentReviews
    ] = await Promise.all([
      Review.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]),
      Review.aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'profile.firstName profile.lastName')
        .populate('product', 'name')
    ]);

    res.json({
      averageRating: averageRating[0]?.averageRating || 0,
      totalReviews: averageRating[0]?.totalReviews || 0,
      ratingDistribution,
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch reviews analytics' 
    });
  }
});

export default router;
