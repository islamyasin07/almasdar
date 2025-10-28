import { connectDB } from '../config/db.js';
import User from '../models/user.model.js';
import { logger } from '../utils/logger.js';

async function run() {
  try {
    await connectDB();

    const testEmail = 'test@almasdar.com';
    const existing = await User.findOne({ email: testEmail });
    
    if (existing) {
      logger.info(`ℹ️  Test user ${testEmail} already exists.`);
      logger.info(`   Password: Test@123`);
      process.exit(0);
    }

    const user = await User.create({
      email: testEmail,
      password: 'Test@123',
      role: 'customer',
      isActive: true,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        company: 'Almasdar Security'
      },
      addresses: []
    });

    logger.info(`✅ Test user created successfully!`);
    logger.info(`   Email: ${user.email}`);
    logger.info(`   Password: Test@123`);
    logger.info(`   Role: ${user.role}`);
    
    process.exit(0);
  } catch (err) {
    logger.error('❌ User seed failed', err);
    process.exit(1);
  }
}

run();
