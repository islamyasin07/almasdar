import { z } from 'zod';
import mongoose from 'mongoose';

export type UserRole = 'admin' | 'customer' | 'staff';

export interface Address {
  _id?: mongoose.Types.ObjectId;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  avatar?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type DiscountType = 'percentage' | 'fixed';

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');