import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Coupon from '../models/coupon.model.js';

const router = Router();

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive(),
    minPurchase: z.number().min(0).default(0),
    maxDiscount: z.number().positive().optional(),
    validFrom: z.string().transform(str => new Date(str)),
    validTo: z.string().transform(str => new Date(str)),
    usageLimit: z.number().int().positive().default(1),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional()
  })
});

const validateCouponSchema = z.object({
  body: z.object({
    code: z.string(),
    cartTotal: z.number().positive()
  })
});

// Validate coupon (public)
router.post('/validate', validate(validateCouponSchema), async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.canUse()) {
      return res.status(400).json({ message: 'Coupon is not valid or has been fully used' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.minPurchase} required` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      discount,
      finalTotal: cartTotal - discount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to validate coupon' 
    });
  }
});

// Admin routes
// Create coupon (admin only)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createCouponSchema),
  async (req, res) => {
    try {
      const coupon = await Coupon.create(req.body);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to create coupon' 
      });
    }
  }
);

// Get all coupons (admin/staff only)
router.get(
  '/',
  authenticate,
  authorize(['admin', 'staff']),
  async (req, res) => {
    try {
      const { isActive, page = 1, limit = 20 } = req.query;

      const query: any = {};
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const skip = (Number(page) - 1) * Number(limit);

      const [coupons, total] = await Promise.all([
        Coupon.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Coupon.countDocuments(query)
      ]);

      res.json({
        coupons,
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch coupons' 
      });
    }
  }
);

// Get single coupon (admin/staff only)
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'staff']),
  async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json(coupon);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch coupon' 
      });
    }
  }
);

// Update coupon (admin only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json(coupon);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update coupon' 
      });
    }
  }
);

// Delete coupon (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete coupon' 
      });
    }
  }
);

// Deactivate coupon (admin only)
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json(coupon);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to deactivate coupon' 
      });
    }
  }
);

export default router;
