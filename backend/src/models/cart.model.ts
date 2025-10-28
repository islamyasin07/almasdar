import mongoose from 'mongoose';

export interface CartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sku: string;
}

export interface ICart {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  subtotal: number;
}

export interface ICartMethods {
  calculateSubtotal(): number;
}

export interface ICartModel extends mongoose.Model<ICart, {}, ICartMethods> {}

const cartItemSchema = new mongoose.Schema<CartItem>({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  price: { 
    type: Number, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  sku: { 
    type: String, 
    required: true 
  }
});

const cartSchema = new mongoose.Schema<ICart>({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  subtotal: { 
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate subtotal before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// Method to calculate subtotal
cartSchema.methods.calculateSubtotal = function(): number {
  return this.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
};

const Cart = mongoose.model<ICart, ICartModel>('Cart', cartSchema);
export default Cart;
