import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Category from '../models/category.model.js';

const router = Router();

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    parent: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
});

const updateCategorySchema = createCategorySchema.deepPartial();

// Public: list categories with optional nesting
router.get('/', async (req, res) => {
  try {
    const { active, q } = req.query;
    const filter: any = {};
    if (active === 'true') filter.isActive = true;
    if (q) filter.$or = [
      { name: { $regex: String(q), $options: 'i' } },
      { slug: { $regex: String(q), $options: 'i' } }
    ];

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch categories' });
  }
});

// Public: get single category by slug or id
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch category' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch category' });
  }
});

// Admin: create
router.post('/', authenticate, authorize(['admin','staff']), validate(createCategorySchema), async (req, res) => {
  try {
    // ensure unique slug
    const exists = await Category.findOne({ slug: req.body.slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create category' });
  }
});

// Admin: update
router.put('/:id', authenticate, authorize(['admin','staff']), validate(updateCategorySchema), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (req.body.slug && req.body.slug !== category.slug) {
      const slugExists = await Category.findOne({ slug: req.body.slug });
      if (slugExists) return res.status(400).json({ message: 'Slug already exists' });
    }

    Object.assign(category, req.body);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update category' });
  }
});

// Admin: delete
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to delete category' });
  }
});

export default router;
