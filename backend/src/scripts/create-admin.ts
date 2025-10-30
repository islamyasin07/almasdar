import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { connectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

async function createAdmin() {
  try {
    await connectDB();
    
    const email = process.argv[2] || 'admin@almasdar.local';
    const password = process.argv[3] || 'Admin@12345';
    const firstName = process.argv[4] || 'khalid';
    const lastName = process.argv[5] || 'yasin';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Update to admin if exists
      existingUser.role = 'admin';
      existingUser.isActive = true;
      if (password !== 'Admin@12345') {
        existingUser.password = password; // Will be hashed by pre-save hook
      }
      await existingUser.save();
      logger.info(`✅ Updated existing user to admin: ${email}`);
    } else {
      // Create new admin
      await User.create({
        email,
        password,
        role: 'admin',
        isActive: true,
        profile: {
          firstName,
          lastName
        }
      });
      logger.info(`✅ Created new admin user: ${email}`);
    }

    logger.info(`📧 Email: ${email}`);
    logger.info(`🔑 Password: ${password}`);
    logger.info(`👤 Name: ${firstName} ${lastName}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
