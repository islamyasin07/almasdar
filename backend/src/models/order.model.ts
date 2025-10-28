import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus, Address } from './types.js';

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string; // Store current product name
  sku: string;  // Store current SKU
}

export interface IOrder {
  customer: mongoose.Types.ObjectId;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
}

export interface IOrderMethods {
  updateStatus(status: OrderStatus, trackingNumber?: string): Promise<void>;
}

export interface IOrderModel extends mongoose.Model<IOrder, {}, IOrderMethods> {}

const orderItemSchema = new mongoose.Schema<OrderItem>({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  name: { 
    type: String, 
    required: true 
  },
  sku: { 
    type: String, 
    required: true 
  }
});

const orderSchema = new mongoose.Schema<IOrder>({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  status: { 
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: { 
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
    index: true
  },
  shippingAddress: { 
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  billingAddress: { 
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  subtotal: { 
    type: Number,
    required: true,
    min: 0
  },
  tax: { 
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: { 
    type: Number,
    required: true,
    min: 0
  },
  total: { 
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  paymentMethod: { 
    type: String,
    required: true
  },
  paymentDetails: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Create compound indices for common queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = async function(
  status: OrderStatus, 
  trackingNumber?: string
): Promise<void> {
  this.status = status;
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
  if (status === 'shipped' && !this.estimatedDelivery) {
    this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  await this.save();
};

const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);
export default Order;