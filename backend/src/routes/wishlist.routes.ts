import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.middleware.js';
import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string()
  })
});

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user?._id }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user?._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch wishlist' 
    });
  }
});

// Add product to wishlist
router.post('/', validate(addToWishlistSchema), async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user?._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        user: req.user?._id, 
        products: [productId] 
      });
    } else {
      // Check if product already in wishlist
      const exists = wishlist.products.some(
        id => id.toString() === productId
      );

      if (exists) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to add to wishlist' 
    });
  }
});

// Remove product from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user?._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    await wishlist.save();
    await wishlist.populate('products');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to remove from wishlist' 
    });
  }
});

// Clear wishlist
router.delete('/', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user?._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to clear wishlist' 
    });
  }
});

export default router;
