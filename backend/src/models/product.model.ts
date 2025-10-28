import mongoose from 'mongoose';
import { ProductStatus } from './types.js';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  specifications: Record<string, string>;
  stock: number;
  status: ProductStatus;
  sku: string;
  brand?: string;
  warranty?: string;
  features: string[];
  technicalDetails?: Record<string, string>;
  installationGuide?: string;
  documents: string[];
}

export interface IProductMethods {
  isInStock(): boolean;
  updateStock(quantity: number): Promise<void>;
}

export interface IProductModel extends mongoose.Model<IProduct, {}, IProductMethods> {}

const productSchema = new mongoose.Schema<IProduct>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  images: [{ 
    type: String,
    required: true 
  }],
  specifications: {
    type: Map,
    of: String
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  status: { 
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
    index: true
  },
  sku: { 
    type: String, 
    required: true,
    unique: true 
  },
  brand: String,
  warranty: String,
  features: [String],
  technicalDetails: {
    type: Map,
    of: String
  },
  installationGuide: String,
  documents: [String]
}, {
  timestamps: true
});

// Create compound index for category and status for efficient filtering
productSchema.index({ category: 1, status: 1 });

// Create text index for search
productSchema.index({ 
  name: 'text', 
  description: 'text',
  brand: 'text'
});

// Method to check if product is in stock
productSchema.methods.isInStock = function(): boolean {
  return this.stock > 0 && this.status === 'active';
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity: number): Promise<void> {
  this.stock += quantity;
  if (this.stock <= 0) {
    this.status = 'out_of_stock';
  }
  await this.save();
};

const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema);
export default Product;