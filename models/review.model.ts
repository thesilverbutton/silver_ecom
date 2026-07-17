import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IReviewImage {
  url: string;
  publicId: string;
}

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  authorName: string;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body: string;
  images?: IReviewImage[];
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewImageSchema = new Schema<IReviewImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    authorName: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    body: { type: String, required: true },
    images: [ReviewImageSchema],
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true },
);

ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
