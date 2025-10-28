import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.middleware.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

const addToCartSchema = z.object({
  body: z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).default(1)
  })
});

const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0)
  })
});

// Get user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch cart' 
    });
  }
});

// Add item to cart
router.post('/', validate(addToCartSchema), async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0],
        sku: product.sku
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to add to cart' 
    });
  }
});

// Update cart item quantity
router.put('/:productId', validate(updateCartItemSchema), async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (quantity === 0) {
      // Remove item
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      // Update quantity
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      // Check stock
      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update cart' 
    });
  }
});

// Remove item from cart
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to remove item' 
    });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to clear cart' 
    });
  }
});

export default router;
