import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISaleItem {
  productId?: Types.ObjectId;
  serialNumber: string;
  productName: string;
  quantity: number;
  price: number;
  images?: string[];
  isReturned?: boolean;
  returnDate?: Date;
  returnReason?: string;
}

export interface IPayment {
  amount: number;
  date: Date;
  method?: string;
  notes?: string;
}

export interface ISale extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  items: ISaleItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: IPayment[];
  status: 'pending' | 'paid' | 'partial' | 'returned';
  notes?: string;
  createdBy: Types.ObjectId;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  serialNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  isReturned: {
    type: Boolean,
    default: false
  },
  returnDate: {
    type: Date
  },
  returnReason: {
    type: String,
    trim: true
  }
});

const paymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  method: {
    type: String,
    trim: true,
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true
  }
});

const saleSchema = new Schema<ISale>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    items: [saleItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    payments: [paymentSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'returned'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search
saleSchema.index({ customerName: 'text' });
saleSchema.index({ saleDate: -1 });

// Calculate status based on payments
saleSchema.pre('save', function(next) {
  const sale = this as ISale;
  
  // Calculate paid amount from payments
  sale.paidAmount = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate remaining amount
  sale.remainingAmount = sale.totalAmount - sale.paidAmount;
  
  // Update status
  if (sale.paidAmount === 0) {
    sale.status = 'pending';
  } else if (sale.paidAmount >= sale.totalAmount) {
    sale.status = 'paid';
  } else {
    sale.status = 'partial';
  }
  
  // Check if all items are returned
  const allReturned = sale.items.length > 0 && sale.items.every(item => item.isReturned);
  if (allReturned) {
    sale.status = 'returned';
  }
  
  next();
});

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
