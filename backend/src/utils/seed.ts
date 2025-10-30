import User from '../models/user.model.js';
import { logger } from './logger.js';

export async function ensureDefaultAdmin() {
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@almasdar.local';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const firstName = process.env.ADMIN_FIRST_NAME || 'khalid';
  const lastName = process.env.ADMIN_LAST_NAME || 'yasin';

  const exists = await User.findOne({ email: defaultEmail });
  if (exists) {
    if (exists.role !== 'admin') {
      exists.role = 'admin';
      exists.isActive = true;
      await exists.save();
      logger.info(`Promoted existing user ${defaultEmail} to admin`);
    }
    return;
  }

  const currentAdminCount = await User.countDocuments({ role: 'admin' });
  if (currentAdminCount > 0 && process.env.FORCE_CREATE_DEFAULT_ADMIN !== 'true') {
    // do not create if admins already exist
    return;
  }

  await User.create({
    email: defaultEmail,
    password: defaultPassword,
    role: 'admin',
    isActive: true,
    profile: { firstName, lastName }
  });
  logger.info(`✅ Default admin ensured: ${defaultEmail} (${firstName} ${lastName})`);
}
