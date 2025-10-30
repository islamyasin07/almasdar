import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Banner from '../models/banner.model.js';

const router = Router();

const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    subtitle: z.string().optional(),
    imageUrl: z.string().min(3),
    linkUrl: z.string().optional(),
    position: z.enum(['hero','homepage','category','product','sidebar','footer']).default('homepage'),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional()
  })
});

const updateBannerSchema = createBannerSchema.deepPartial();

// Public: active banners for a position
router.get('/', async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date();
    const filter: any = { isActive: true, $or: [
      { startsAt: { $exists: false } }, { startsAt: { $lte: now } }
    ], $or2: [
      { endsAt: { $exists: false } }, { endsAt: { $gte: now } }
    ] };
    if (position) filter.position = position;

    const banners = await Banner.find({
      isActive: true,
      ...(position ? { position } : {}),
      $and: [
        { $or: [ { startsAt: { $exists: false } }, { startsAt: { $lte: now } } ] },
        { $or: [ { endsAt: { $exists: false } }, { endsAt: { $gte: now } } ] }
      ]
    }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch banners' });
  }
});

// Admin: list all banners with filters
router.get('/admin', authenticate, authorize(['admin','staff']), async (req, res) => {
  try {
    const { position, active } = req.query;
    const filter: any = {};
    if (position) filter.position = position;
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    const banners = await Banner.find(filter).sort({ position: 1, sortOrder: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch banners' });
  }
});

// Admin: create banner
router.post('/', authenticate, authorize(['admin','staff']), validate(createBannerSchema), async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.startsAt) body.startsAt = new Date(body.startsAt);
    if (body.endsAt) body.endsAt = new Date(body.endsAt);
    const banner = await Banner.create(body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create banner' });
  }
});

// Admin: update banner
router.put('/:id', authenticate, authorize(['admin','staff']), validate(updateBannerSchema), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    const body = { ...req.body } as any;
    if (body.startsAt) body.startsAt = new Date(body.startsAt);
    if (body.endsAt) body.endsAt = new Date(body.endsAt);
    Object.assign(banner, body);
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update banner' });
  }
});

// Admin: delete banner
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to delete banner' });
  }
});

export default router;
