import mongoose from 'mongoose';

export type BannerPosition = 'hero' | 'homepage' | 'category' | 'product' | 'sidebar' | 'footer';

export interface IBanner {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

const bannerSchema = new mongoose.Schema<IBanner>({
  title: { type: String, required: true, trim: true },
  subtitle: String,
  imageUrl: { type: String, required: true },
  linkUrl: String,
  position: { type: String, enum: ['hero','homepage','category','product','sidebar','footer'], default: 'homepage', index: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  startsAt: Date,
  endsAt: Date
}, { timestamps: true });

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export default Banner;
