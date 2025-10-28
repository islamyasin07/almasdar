import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { AuthService } from '../services/auth.service.js';
import User from '../models/user.model.js';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().optional(),
      company: z.string().optional()
    })
  })
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});

// Login route
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ 
      message: error instanceof Error ? error.message : 'Authentication failed' 
    });
  }
});

// Register route
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, profile } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      profile,
      role: 'customer', // Default role for registration
      isActive: true
    });

    const tokens = AuthService.generateAuthTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      tokens
    });
  } catch (error) {
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Registration failed' 
    });
  }
});

// Refresh token route
router.post('/refresh-token', validate(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ 
      message: error instanceof Error ? error.message : 'Token refresh failed' 
    });
  }
});

export default router;