import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  cartId?: string;
  customerId?: mongoose.Types.ObjectId;
  items: ICartItem[];
  couponCode?: string;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const CartSchema = new Schema<ICart>(
  {
    cartId: { type: String },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    items: [CartItemSchema],
    couponCode: { type: String },
  },
  { timestamps: true },
);

// TTL: clean abandoned carts after 30 days
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
CartSchema.index({ cartId: 1 }, { sparse: true });
CartSchema.index({ customerId: 1 }, { sparse: true });

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
