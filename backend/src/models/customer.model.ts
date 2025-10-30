import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true
    },
    address: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    totalPurchases: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for search
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
