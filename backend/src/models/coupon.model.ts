import mongoose from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';

export interface ICoupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: string[];
}

export interface ICouponMethods {
  isValid(): boolean;
  canUse(): boolean;
}

export interface ICouponModel extends mongoose.Model<ICoupon, {}, ICouponMethods> {}

const couponSchema = new mongoose.Schema<ICoupon>({
  code: { 
    type: String, 
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  discountType: { 
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: { 
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: { 
    type: Number,
    default: 0
  },
  maxDiscount: Number,
  validFrom: { 
    type: Date,
    required: true
  },
  validTo: { 
    type: Date,
    required: true
  },
  usageLimit: { 
    type: Number,
    default: 1
  },
  usedCount: { 
    type: Number,
    default: 0
  },
  isActive: { 
    type: Boolean,
    default: true
  },
  applicableProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product'
  }],
  applicableCategories: [String]
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTo >= now;
};

// Check if coupon can be used
couponSchema.methods.canUse = function(): boolean {
  return this.isValid() && this.usedCount < this.usageLimit;
};

const Coupon = mongoose.model<ICoupon, ICouponModel>('Coupon', couponSchema);
export default Coupon;
