import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  appliesTo?: {
    categoryIds?: mongoose.Types.ObjectId[];
    productIds?: mongoose.Types.ObjectId[];
  };
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, uppercase: true },
    description: { type: String },
    type: { type: String, enum: ["percentage", "fixed", "free_shipping"], required: true },
    value: { type: Number, required: true },
    minSubtotal: { type: Number },
    maxDiscount: { type: Number },
    appliesTo: {
      categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perCustomerLimit: { type: Number },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, expiresAt: 1 });

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
