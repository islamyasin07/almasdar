import { Customer } from '../models/customer.model.js';
import { Sale } from '../models/sale.model.js';
import { Product } from '../models/product.model.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize all database indexes
 * This ensures all required indexes are created on startup
 */
export const initializeIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    // Customer indexes
    await Customer.collection.createIndex({ name: 1 });
    await Customer.collection.createIndex({ phone: 1 }, { sparse: true });
    await Customer.collection.createIndex({ email: 1 }, { sparse: true });
    await Customer.collection.createIndex({ name: 'text', phone: 'text', email: 'text' });
    await Customer.collection.createIndex({ totalSpent: -1 });
    await Customer.collection.createIndex({ totalPurchases: -1 });
    await Customer.collection.createIndex({ createdAt: -1 });
    logger.info('✓ Customer indexes created');

    // Product indexes
    await Product.collection.createIndex({ serialNumber: 1 }, { unique: true, sparse: true });
    await Product.collection.createIndex({ sku: 1 }, { unique: true });
    await Product.collection.createIndex({ category: 1, status: 1 });
    await Product.collection.createIndex({ 
      name: 'text', 
      description: 'text',
      brand: 'text',
      serialNumber: 'text'
    });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ stock: 1 });
    await Product.collection.createIndex({ status: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    logger.info('✓ Product indexes created');

    // Sale indexes
    await Sale.collection.createIndex({ customerId: 1 });
    await Sale.collection.createIndex({ customerName: 1 });
    await Sale.collection.createIndex({ customerName: 'text' });
    await Sale.collection.createIndex({ 'items.serialNumber': 1 });
    await Sale.collection.createIndex({ status: 1 });
    await Sale.collection.createIndex({ saleDate: -1 });
    await Sale.collection.createIndex({ createdBy: 1 });
    await Sale.collection.createIndex({ createdAt: -1 });
    await Sale.collection.createIndex({ totalAmount: -1 });
    await Sale.collection.createIndex({ remainingAmount: -1 });
    
    // Compound indexes for common queries
    await Sale.collection.createIndex({ customerId: 1, saleDate: -1 });
    await Sale.collection.createIndex({ status: 1, saleDate: -1 });
    await Sale.collection.createIndex({ createdBy: 1, saleDate: -1 });
    logger.info('✓ Sale indexes created');

    logger.info('All database indexes created successfully!');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    // Don't throw error - indexes might already exist
  }
};

/**
 * Check index statistics
 */
export const getIndexStats = async () => {
  try {
    const customerIndexes = await Customer.collection.indexes();
    const productIndexes = await Product.collection.indexes();
    const saleIndexes = await Sale.collection.indexes();

    return {
      customer: {
        count: customerIndexes.length,
        indexes: customerIndexes.map((idx: any) => idx.name)
      },
      product: {
        count: productIndexes.length,
        indexes: productIndexes.map((idx: any) => idx.name)
      },
      sale: {
        count: saleIndexes.length,
        indexes: saleIndexes.map((idx: any) => idx.name)
      }
    };
  } catch (error) {
    logger.error('Error getting index stats:', error);
    return null;
  }
};

/**
 * Validate required indexes
 */
export const validateIndexes = async (): Promise<boolean> => {
  try {
    const stats = await getIndexStats();
    if (!stats) return false;

    const requiredIndexes = {
      customer: 7,
      product: 8,
      sale: 13
    };

    const isValid = 
      stats.customer.count >= requiredIndexes.customer &&
      stats.product.count >= requiredIndexes.product &&
      stats.sale.count >= requiredIndexes.sale;

    if (!isValid) {
      logger.error('Some indexes are missing. Expected:', requiredIndexes, 'Got:', {
        customer: stats.customer.count,
        product: stats.product.count,
        sale: stats.sale.count
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Error validating indexes:', error);
    return false;
  }
};
