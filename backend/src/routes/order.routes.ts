import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { OrderStatus } from '../models/types.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      isDefault: z.boolean().optional()
    }),
    billingAddress: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      isDefault: z.boolean().optional()
    }),
    paymentMethod: z.string(),
    paymentDetails: z.record(z.any()).optional(),
    notes: z.string().optional(),
    couponCode: z.string().optional()
  })
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().optional()
  })
});

// Create order from cart
router.post('/', validate(createOrderSchema), async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, paymentDetails, notes, couponCode } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}` 
        });
      }
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    let total = subtotal + tax + shippingCost;

    // Apply coupon if provided (implement coupon logic here)
    // TODO: Add coupon validation and discount calculation

    // Create order
    const order = await Order.create({
      customer: req.user?._id,
      items: cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        sku: item.sku
      })),
      shippingAddress,
      billingAddress,
      subtotal,
      tax,
      shippingCost,
      total,
      paymentMethod,
      paymentDetails,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('items.product');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create order' 
    });
  }
});

// Get user's orders
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { customer: req.user?._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch orders' 
    });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user can only see their own orders (unless admin)
    if (order.customer.toString() !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch order' 
    });
  }
});

// Cancel order
router.post('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user can only cancel their own orders
    if (order.customer.toString() !== req.user?._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to cancel order' 
    });
  }
});

// Admin routes
// Get all orders (admin/staff only)
router.get('/admin/all', authorize(['admin', 'staff']), async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus,
      page = 1, 
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const sortString = typeof sort === 'string' ? sort : '-createdAt';

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'email profile')
        .populate('items.product')
        .sort(sortString)
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch orders' 
    });
  }
});

// Update order status (admin/staff only)
router.put(
  '/:id/status',
  authorize(['admin', 'staff']),
  validate(updateOrderStatusSchema),
  async (req, res) => {
    try {
      const { status, trackingNumber } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.updateStatus(status as OrderStatus, trackingNumber);

      res.json(order);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update order status' 
      });
    }
  }
);

export default router;
