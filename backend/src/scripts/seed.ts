import { connectDB } from '../config/db.js';
import Product from '../models/product.model.js';
import { logger } from '../utils/logger.js';

async function run() {
  try {
    await connectDB();

    const count = await Product.estimatedDocumentCount();
    if (count > 0) {
      logger.info(`ℹ️  Products already exist (${count}), skipping seed.`);
      process.exit(0);
    }

    const products = [
      {
        name: '4K CCTV Camera Pro',
        description: 'Ultra HD 4K CCTV camera with night vision and motion detection.',
        price: 249.99,
        category: 'cctv',
        images: ['https://picsum.photos/seed/cctv1/600/400'],
        specifications: { Resolution: '4K', NightVision: 'Yes', IPRating: 'IP67' },
        stock: 25,
        sku: 'CCTV-4K-PRO',
        brand: 'SecureVision',
        warranty: '2 Years',
        features: ['Motion Detection', 'Infrared Night Vision', 'Weatherproof'],
        technicalDetails: { Sensor: 'Sony IMX', Lens: '3.6mm' },
        documents: []
      },
      {
        name: 'Smart Door Lock X',
        description: 'Smart lock with biometric fingerprint and Bluetooth connectivity.',
        price: 179.0,
        category: 'smart-locks',
        images: ['https://picsum.photos/seed/lock1/600/400'],
        specifications: { Fingerprint: 'Yes', Bluetooth: 'Yes', Battery: '6 months' },
        stock: 40,
        sku: 'SL-X-100',
        brand: 'LockMate',
        warranty: '1 Year',
        features: ['Biometric', 'Auto-lock', 'App Control'],
        technicalDetails: { Material: 'Zinc Alloy' },
        documents: []
      },
      {
        name: 'Access Control Panel A1',
        description: 'Professional access control panel supporting up to 4 doors.',
        price: 399.5,
        category: 'access-control',
        images: ['https://picsum.photos/seed/access1/600/400'],
        specifications: { Doors: '4', Inputs: '8', Outputs: '8' },
        stock: 10,
        sku: 'ACP-A1',
        brand: 'GateGuard',
        warranty: '2 Years',
        features: ['Anti-passback', 'Event Logs', 'Wiegand'],
        technicalDetails: { CPU: 'ARM', Memory: '128MB' },
        documents: []
      }
    ];

    await Product.insertMany(products);
    logger.info(`✅ Seeded ${products.length} products.`);
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seed failed', err);
    process.exit(1);
  }
}

run();
