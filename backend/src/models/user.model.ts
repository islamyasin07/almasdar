import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserRole, Address, UserProfile } from './types.js';

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  addresses: Address[];
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

export interface IUserModel extends mongoose.Model<IUser, {}, IUserMethods> {}

const addressSchema = new mongoose.Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userProfileSchema = new mongoose.Schema<UserProfile>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  company: String,
  avatar: String
});

const userSchema = new mongoose.Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8 
  },
  role: { 
    type: String, 
    enum: ['admin', 'customer', 'staff'],
    default: 'customer' 
  },
  profile: userProfileSchema,
  addresses: [addressSchema],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return resetToken;
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;