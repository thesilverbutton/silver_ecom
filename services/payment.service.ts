import { createHmac } from "crypto";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/payment.model";
import { getRazorpay } from "@/lib/razorpay";
import { logger } from "@/lib/logger";

/**
 * Create a Razorpay order and a Payment record.
 */
export async function createRazorpayOrder(orderId: string, amount: number, orderNumber: string) {
  await connectDB();
  const razorpay = getRazorpay();

  // amount must be in paise and >= 100
  const safeAmount = Math.max(amount, 100);

  const rpOrder = await razorpay.orders.create({
    amount: safeAmount,
    currency: "INR",
    receipt: orderNumber,
    notes: { orderId, orderNumber },
  });

  // Create payment record
  const payment = await Payment.create({
    orderId,
    provider: "razorpay",
    razorpayOrderId: rpOrder.id,
    amount: safeAmount,
    currency: "INR",
    status: "created",
    webhookEvents: [],
    refunds: [],
  });

  logger.info("Razorpay order created", {
    razorpayOrderId: rpOrder.id,
    orderId,
    amount: safeAmount,
  });

  return {
    razorpayOrderId: rpOrder.id,
    amount: safeAmount,
    currency: "INR",
    paymentId: String(payment._id),
  };
}

/**
 * Verify Razorpay payment signature (client callback).
 * HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET not configured");

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");

  return expectedSignature === razorpaySignature;
}

/**
 * Verify Razorpay webhook signature.
 * HMAC-SHA256(raw_body, WEBHOOK_SECRET)
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("RAZORPAY_WEBHOOK_SECRET not set, skipping webhook signature check");
    return true; // In dev without webhook secret, allow through
  }

  const expectedSignature = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expectedSignature === signature;
}

/**
 * Update payment record after client verification.
 * Does NOT finalize the order — that happens in the webhook.
 */
export async function markPaymentVerified(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  await connectDB();

  await Payment.updateOne(
    { razorpayOrderId },
    {
      $set: {
        razorpayPaymentId,
        razorpaySignature,
      },
    },
  );

  logger.info("Payment signature verified (client)", { razorpayOrderId, razorpayPaymentId });
}

/**
 * Handle webhook event — mark payment captured/failed.
 * Returns the payment record for further processing.
 */
export async function handleWebhookPaymentEvent(
  event: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  method?: string,
) {
  await connectDB();

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    logger.error("Webhook: payment not found", { razorpayOrderId });
    return null;
  }

  // Idempotent — skip if already processed
  if (payment.status === "captured" && event.includes("captured")) {
    logger.info("Webhook: already processed", { razorpayOrderId, event });
    return payment;
  }

  // Record webhook event
  payment.webhookEvents.push({ event, at: new Date(), verified: true });

  if (event === "payment.captured" || event === "order.paid") {
    payment.status = "captured";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.method = method;
  } else if (event === "payment.failed") {
    payment.status = "failed";
  }

  await payment.save();
  return payment;
}
