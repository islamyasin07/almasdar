import mongoose from 'mongoose';
import { Customer } from '../models/customer.model.js';
import { Sale } from '../models/sale.model.js';
import { Product } from '../models/product.model.js';
import { logger } from '../utils/logger.js';

/**
 * Seed sample data for testing
 * This creates sample customers, products with serial numbers, and sales
 */
export const seedSalesData = async () => {
  try {
    logger.info('Starting to seed sales data...');

    // Check if data already exists
    const customerCount = await Customer.countDocuments();
    if (customerCount > 0) {
      logger.info('Sales data already exists. Skipping seed.');
      return;
    }

    // Sample customers
    const customers = await Customer.insertMany([
      {
        name: 'أحمد محمد',
        phone: '0791234567',
        email: 'ahmed@example.com',
        address: 'عمان، الأردن',
        notes: 'زبون دائم'
      },
      {
        name: 'فاطمة علي',
        phone: '0792345678',
        email: 'fatima@example.com',
        address: 'إربد، الأردن'
      },
      {
        name: 'محمود خالد',
        phone: '0793456789',
        address: 'الزرقاء، الأردن'
      },
      {
        name: 'سارة يوسف',
        phone: '0794567890',
        email: 'sara@example.com',
        address: 'عمان، الأردن'
      }
    ]);

    logger.info(`✓ Created ${customers.length} sample customers`);

    // Update some products with serial numbers (if products exist)
    const products = await Product.find().limit(10);
    if (products.length > 0) {
      for (let i = 0; i < Math.min(products.length, 10); i++) {
        const product = products[i];
        if (!product.serialNumber) {
          product.serialNumber = `SN-${Date.now()}-${i.toString().padStart(4, '0')}`;
          await product.save();
        }
      }
      logger.info(`✓ Updated ${products.length} products with serial numbers`);
    }

    // Sample sales (you would need to get a real admin user ID)
    // This is just a structure example
    const sampleSales = [
      {
        customerId: customers[0]._id,
        customerName: customers[0].name,
        items: [
          {
            serialNumber: 'SN-CAM-001',
            productName: 'كاميرا مراقبة خارجية 4MP',
            quantity: 2,
            price: 120
          },
          {
            serialNumber: 'SN-CAM-002',
            productName: 'كاميرا مراقبة داخلية 2MP',
            quantity: 3,
            price: 80
          }
        ],
        totalAmount: 480,
        payments: [
          {
            amount: 300,
            date: new Date(),
            method: 'cash'
          }
        ],
        notes: 'تركيب في عمان',
        saleDate: new Date()
      },
      {
        customerId: customers[1]._id,
        customerName: customers[1].name,
        items: [
          {
            serialNumber: 'SN-DVR-001',
            productName: 'جهاز DVR 8 قنوات',
            quantity: 1,
            price: 250
          }
        ],
        totalAmount: 250,
        payments: [
          {
            amount: 250,
            date: new Date(),
            method: 'card'
          }
        ],
        notes: 'دفع كامل',
        saleDate: new Date()
      }
    ];

    logger.info('Note: Sample sales need a valid admin user ID to be created');
    logger.info('Sales data structure is ready for manual testing');

    logger.info('✓ Sales data seeding completed!');
  } catch (error) {
    logger.error('Error seeding sales data:', error);
  }
};

/**
 * Clean all sales-related data
 * USE WITH CAUTION - This will delete all customers and sales!
 */
export const cleanSalesData = async () => {
  try {
    logger.info('Cleaning sales data...');
    
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    
    logger.info('✓ Sales data cleaned');
  } catch (error) {
    logger.error('Error cleaning sales data:', error);
  }
};
