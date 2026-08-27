import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  sku?: string;
  title: string;
  image: string;
  options?: Record<string, string>;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrderEvent {
  at: Date;
  status: string;
  note?: string;
  by?: string;
}

export interface IOrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  isGuest: boolean;
  email: string;
  phone: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded" | "partially_refunded";
  fulfillmentStatus: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentId?: mongoose.Types.ObjectId;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  invoiceUrl?: string;
  notes?: string;
  timeline: IOrderEvent[];
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId },
    sku: { type: String },
    title: { type: String, required: true },
    image: { type: String, required: true },
    options: { type: Schema.Types.Mixed },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const OrderEventSchema = new Schema<IOrderEvent>(
  {
    at: { type: Date, required: true },
    status: { type: String, required: true },
    note: { type: String },
    by: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    isGuest: { type: Boolean, default: false },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: { type: OrderAddressSchema, required: true },
    billingAddress: { type: OrderAddressSchema },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded", "partially_refunded"],
      default: "unpaid",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["unfulfilled", "processing", "shipped", "delivered", "cancelled"],
      default: "unfulfilled",
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingUrl: { type: String },
    invoiceUrl: { type: String },
    notes: { type: String },
    timeline: [OrderEventSchema],
    cancelledReason: { type: String },
  },
  { timestamps: true },
);

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ email: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ awbCode: 1 }, { sparse: true });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
