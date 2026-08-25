import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRefund {
  refundId: string;
  amount: number;
  status: string;
  at: Date;
}

export interface IWebhookEvent {
  event: string;
  at: Date;
  verified: boolean;
}

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  provider: "cashfree";
  cashfreeOrderId?: string;
  cfOrderId?: string;
  cfPaymentId?: string;
  paymentSessionId?: string;

  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  method?: string;
  refunds: IRefund[];
  webhookEvents: IWebhookEvent[];
  errorCode?: string;
  errorDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    at: { type: Date, required: true },
  },
  { _id: false },
);

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    event: { type: String, required: true },
    at: { type: Date, required: true },
    verified: { type: Boolean, required: true },
  },
  { _id: false },
);

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: { type: String, default: "cashfree", enum: ["cashfree"] },
    cashfreeOrderId: { type: String },
    cfOrderId: { type: String },
    cfPaymentId: { type: String },
    paymentSessionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "partially_refunded"],
      default: "created",
    },
    method: { type: String },
    refunds: [RefundSchema],
    webhookEvents: [WebhookEventSchema],
    errorCode: { type: String },
    errorDescription: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ cashfreeOrderId: 1 }, { sparse: true });
PaymentSchema.index({ cfOrderId: 1 }, { sparse: true });
PaymentSchema.index({ cfPaymentId: 1 }, { sparse: true });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
