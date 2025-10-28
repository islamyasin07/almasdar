import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

const router = Router();

const createReviewSchema = z.object({
  body: z.object({
    productId: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(5).max(100),
    comment: z.string().min(10).max(1000)
  })
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(5).max(100).optional(),
    comment: z.string().min(10).max(1000).optional()
  })
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const sortString = typeof sort === 'string' ? sort : '-createdAt';

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'profile.firstName profile.lastName')
        .sort(sortString)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ product: productId })
    ]);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
      averageRating: avgRating[0]?.average || 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch reviews' 
    });
  }
});

// Create review (requires authentication and verified purchase)
router.post('/', authenticate, validate(createReviewSchema), async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user?._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      customer: req.user?._id,
      'items.product': productId,
      status: 'delivered'
    });

    const review = await Review.create({
      product: productId,
      user: req.user?._id,
      rating,
      title,
      comment,
      verified: !!hasPurchased
    });

    await review.populate('user', 'profile.firstName profile.lastName');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create review' 
    });
  }
});

// Update review
router.put('/:id', authenticate, validate(updateReviewSchema), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure user can only update their own review
    if (review.user.toString() !== req.user?._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(review, req.body);
    await review.save();
    await review.populate('user', 'profile.firstName profile.lastName');

    res.json(review);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update review' 
    });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure user can only delete their own review (or admin)
    if (review.user.toString() !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to delete review' 
    });
  }
});

// Mark review as helpful
router.post('/:id/helpful', authenticate, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate('user', 'profile.firstName profile.lastName');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update review' 
    });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user?._id })
      .populate('product', 'name images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch reviews' 
    });
  }
});

export default router;
