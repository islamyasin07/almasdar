import mongoose from 'mongoose';

export interface IReview {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

const reviewSchema = new mongoose.Schema<IReview>({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  comment: { 
    type: String, 
    required: true
  },
  verified: { 
    type: Boolean,
    default: false
  },
  helpful: { 
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
