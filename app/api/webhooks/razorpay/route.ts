import { NextRequest } from "next/server";
import { verifyWebhookSignature, handleWebhookPaymentEvent } from "@/services/payment.service";
import { finalizeOrder } from "@/services/order.service";
import { sendOrderConfirmation } from "@/services/email.service";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/payment.model";
import { Order } from "@/models/order.model";
import { generateTraceId, logger } from "@/lib/logger";

/**
 * POST /api/webhooks/razorpay
 * THE SOURCE OF TRUTH for order finalization.
 * Verifies webhook signature, then finalizes the order atomically.
 */
export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.error("Webhook signature invalid", { traceId });
      return Response.json({ ok: false, error: "SIGNATURE_INVALID" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event as string;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return Response.json({ ok: true }); // Non-payment event, ignore
    }

    const razorpayOrderId = paymentEntity.order_id as string;
    const razorpayPaymentId = paymentEntity.id as string;
    const method = paymentEntity.method as string | undefined;

    logger.info("Webhook received", { event, razorpayOrderId, razorpayPaymentId }, traceId);

    await connectDB();

    // Handle the event
    if (event === "payment.captured" || event === "order.paid") {
      // Update payment record
      const payment = await handleWebhookPaymentEvent(event, razorpayOrderId, razorpayPaymentId, method);
      if (!payment) {
        logger.error("Webhook: payment record not found", { razorpayOrderId }, traceId);
        return Response.json({ ok: true }); // Return 200 to avoid Razorpay retries for missing record
      }

      // Idempotent check — if order already paid, skip
      const order = await Order.findById(payment.orderId);
      if (order && order.status === "paid") {
        logger.info("Webhook: order already finalized, skipping", { orderId: String(order._id) }, traceId);
        return Response.json({ ok: true });
      }

      // Finalize order (atomic inventory decrement)
      if (order) {
        await finalizeOrder(String(order._id), traceId);

        // Send confirmation email (non-blocking, retry-safe)
        sendOrderConfirmation({
          email: order.email,
          orderNumber: order.orderNumber,
          items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, lineTotal: i.lineTotal })),
          grandTotal: order.grandTotal,
          shippingAddress: order.shippingAddress,
        }).catch(() => {}); // Don't block on email failure

        logger.info("Order finalized via webhook", { orderNumber: order.orderNumber }, traceId);
      }
    } else if (event === "payment.failed") {
      await handleWebhookPaymentEvent(event, razorpayOrderId, razorpayPaymentId, method);

      // Update order status
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment) {
        await Order.updateOne(
          { _id: payment.orderId },
          { $push: { timeline: { at: new Date(), status: "payment_failed", note: "Payment failed" } } },
        );
      }

      logger.info("Payment failed webhook processed", { razorpayOrderId }, traceId);
    } else if (event === "refund.processed") {
      // Handle refund
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity && razorpayPaymentId) {
        const payment = await Payment.findOne({ razorpayPaymentId });
        if (payment) {
          payment.refunds.push({
            refundId: refundEntity.id,
            amount: refundEntity.amount,
            status: "processed",
            at: new Date(),
          });
          payment.status = payment.amount === refundEntity.amount ? "refunded" : "partially_refunded";
          await payment.save();

          await Order.updateOne(
            { _id: payment.orderId },
            {
              paymentStatus: payment.status,
              $push: { timeline: { at: new Date(), status: "refund_processed", note: `Refund ₹${refundEntity.amount / 100}` } },
            },
          );
        }
      }
      logger.info("Refund webhook processed", { razorpayPaymentId }, traceId);
    }

    // Always return 200 quickly to acknowledge
    return Response.json({ ok: true });
  } catch (error) {
    logger.error("Webhook processing error", { error: String(error) }, traceId);
    // Still return 200 to prevent Razorpay from retrying on our internal errors
    return Response.json({ ok: true });
  }
}
