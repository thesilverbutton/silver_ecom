import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  position: number;
}

export interface IVariant {
  _id: mongoose.Types.ObjectId;
  sku: string;
  options: Record<string, string>;
  priceDelta: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId;
  collectionIds: mongoose.Types.ObjectId[];
  gender: "men" | "women" | "unisex";
  brand: string;
  images: IProductImage[];
  basePrice: number;
  compareAtPrice?: number;
  currency: string;
  hasVariants: boolean;
  variants: IVariant[];
  stock: number;
  sku?: string;
  // Fashion / handloom attributes
  fabric: string;
  weave?: string;
  color?: string;
  pattern?: string;
  occasion?: string;
  fit?: string;
  careInstructions?: string;
  sizeChart?: string;
  madeIn?: string;
  // Merchandising
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  status: "draft" | "active" | "archived";
  ratingAverage: number;
  ratingCount: number;
  seo?: { title?: string; description?: string; ogImage?: string };
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    position: { type: Number, required: true },
  },
  { _id: false },
);

const VariantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  options: { type: Schema.Types.Mixed, required: true },
  priceDelta: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String },
  isActive: { type: Boolean, default: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 160 },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    collectionIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    gender: { type: String, enum: ["men", "women", "unisex"], required: true },
    brand: { type: String, default: "The Silver Button" },
    images: [ProductImageSchema],
    basePrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    currency: { type: String, default: "INR" },
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String },
    // Fashion / handloom attributes
    fabric: { type: String, required: true },
    weave: { type: String },
    color: { type: String },
    pattern: { type: String },
    occasion: { type: String },
    fit: { type: String },
    careInstructions: { type: String },
    sizeChart: { type: String },
    madeIn: { type: String, default: "India" },
    // Merchandising
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "active", "archived"], default: "draft" },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
      ogImage: { type: String },
    },
  },
  { timestamps: true },
);

// Indexes
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ categoryId: 1, status: 1 });
ProductSchema.index({ gender: 1, status: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ "variants.sku": 1 }, { sparse: true, unique: true });
ProductSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 } },
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
