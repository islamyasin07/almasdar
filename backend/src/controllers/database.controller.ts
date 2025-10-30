import { Request, Response } from 'express';
import { getIndexStats, validateIndexes } from '../config/indexes.js';
import { Customer } from '../models/customer.model.js';
import { Sale } from '../models/sale.model.js';
import { Product } from '../models/product.model.js';

/**
 * Get database health and statistics
 */
export const getDatabaseHealth = async (req: Request, res: Response) => {
  try {
    // Get collection counts
    const [customerCount, saleCount, productCount] = await Promise.all([
      Customer.countDocuments(),
      Sale.countDocuments(),
      Product.countDocuments()
    ]);

    // Get index statistics
    const indexStats = await getIndexStats();
    
    // Validate indexes
    const indexesValid = await validateIndexes();

    res.json({
      success: true,
      data: {
        collections: {
          customers: {
            count: customerCount
          },
          sales: {
            count: saleCount
          },
          products: {
            count: productCount
          }
        },
        indexes: indexStats,
        indexesValid
      }
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get sales statistics
 */
export const getSalesStatistics = async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Aggregate sales data
    const [stats] = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalRemaining: { $sum: '$remainingAmount' },
          salesCount: { $sum: 1 },
          avgSaleAmount: { $avg: '$totalAmount' },
          maxSaleAmount: { $max: '$totalAmount' },
          minSaleAmount: { $min: '$totalAmount' }
        }
      }
    ]);

    // Get status breakdown
    const statusBreakdown = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get top customers
    const topCustomers = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          totalSpent: { $sum: '$totalAmount' },
          purchaseCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get sales by day
    const salesByDay = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$saleDate' }
          },
          totalAmount: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        summary: stats || {
          totalSales: 0,
          totalPaid: 0,
          totalRemaining: 0,
          salesCount: 0,
          avgSaleAmount: 0,
          maxSaleAmount: 0,
          minSaleAmount: 0
        },
        statusBreakdown: statusBreakdown.reduce((acc: any, item: any) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {}),
        topCustomers,
        salesByDay
      }
    });
  } catch (error) {
    console.error('Sales statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
