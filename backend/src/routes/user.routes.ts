import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

const updateProfileSchema = z.object({
  body: z.object({
    profile: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      avatar: z.string().optional()
    }).optional()
  })
});

const addAddressSchema = z.object({
  body: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    isDefault: z.boolean().optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8)
  })
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select('-password -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch profile' 
    });
  }
});

// Update user profile
router.put('/profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.profile) {
      Object.assign(user.profile, req.body.profile);
    }

    await user.save();

    res.json({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      profile: user.profile
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update profile' 
    });
  }
});

// Get user addresses
router.get('/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select('addresses');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch addresses' 
    });
  }
});

// Add new address
router.post('/addresses', validate(addAddressSchema), async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to add address' 
    });
  }
});

// Update address
router.put('/addresses/:addressId', validate(addAddressSchema), async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id?.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, unset others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(user.addresses[addressIndex], req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update address' 
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter(
      addr => addr._id?.toString() !== req.params.addressId
    );
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to delete address' 
    });
  }
});

// Change password
router.post('/change-password', validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to change password' 
    });
  }
});

export default router;
