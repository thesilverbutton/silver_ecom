import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAddress {
  _id: mongoose.Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  emailVerified?: Date;
  addresses: IAddress[];
  defaultAddressId?: mongoose.Types.ObjectId;
  wishlist: mongoose.Types.ObjectId[];
  role: "customer";
  isBlocked: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    passwordHash: { type: String },
    phone: { type: String },
    emailVerified: { type: Date },
    addresses: [AddressSchema],
    defaultAddressId: { type: Schema.Types.ObjectId },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    role: { type: String, default: "customer", enum: ["customer"] },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 }, { sparse: true });

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
