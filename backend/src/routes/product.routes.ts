import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Product from '../models/product.model.js';

const router = Router();

// Product validation schemas
const productSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    price: z.number().positive(),
    category: z.string(),
    images: z.array(z.string()).min(1),
    specifications: z.record(z.string()),
    stock: z.number().int().min(0),
    sku: z.string(),
    brand: z.string().optional(),
    warranty: z.string().optional(),
    features: z.array(z.string()),
    technicalDetails: z.record(z.string()).optional(),
    installationGuide: z.string().optional(),
    documents: z.array(z.string()).optional()
  })
});

const updateProductSchema = productSchema.deepPartial();

// List products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status,
      minPrice, 
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query: any = {};
    
    // Apply filters
    if (category) query.category = category;
    if (status && status !== 'all') query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Apply text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortString = typeof sort === 'string' ? sort : '-createdAt';

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortString)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch products' 
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch product' 
    });
  }
});

// Create product (admin/staff only)
router.post(
  '/',
  authenticate,
  authorize(['admin', 'staff']),
  validate(productSchema),
  async (req, res) => {
    try {
      // Check if SKU exists
      const existingSku = await Product.findOne({ sku: req.body.sku });
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }

      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to create product' 
      });
    }
  }
);

// Update product (admin/staff only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'staff']),
  validate(updateProductSchema),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // If updating SKU, check it doesn't conflict
      if (req.body.sku && req.body.sku !== product.sku) {
        const existingSku = await Product.findOne({ sku: req.body.sku });
        if (existingSku) {
          return res.status(400).json({ message: 'SKU already exists' });
        }
      }

      Object.assign(product, req.body);
      await product.save();

      res.json(product);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update product' 
      });
    }
  }
);

// Delete product (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete product' 
      });
    }
  }
);

// Update stock level (admin/staff only)
router.patch(
  '/:id/stock',
  authenticate,
  authorize(['admin', 'staff']),
  validate(z.object({
    body: z.object({
      quantity: z.number().int()
    })
  })),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await product.updateStock(req.body.quantity);
      res.json(product);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update stock' 
      });
    }
  }
);

// Get product categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch categories' 
    });
  }
});

export default router;