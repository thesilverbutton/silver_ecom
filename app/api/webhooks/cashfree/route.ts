import { NextRequest } from "next/server";
import { verifyWebhookSignature, handleWebhookCashfreeEvent } from "@/services/payment.service";
import { finalizeOrder } from "@/services/order.service";
import { sendOrderConfirmation } from "@/services/email.service";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/payment.model";
import { Order } from "@/models/order.model";
import { generateTraceId, logger } from "@/lib/logger";

/**
 * POST /api/webhooks/cashfree
 * Source of truth for async Cashfree payment events.
 * Verifies signature, then finalizes order atomically on payment success.
 */
export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // Verify webhook signature (HMAC-SHA256 of timestamp + rawBody)
    const isValid = verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      logger.error("Cashfree webhook signature invalid", { traceId });
      return Response.json({ ok: false, error: "SIGNATURE_INVALID" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type as string;
    const eventData = payload.data;

    logger.info("Cashfree webhook received", { eventType, eventTime: payload.event_time }, traceId);

    await connectDB();

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = eventData?.order;
      const paymentData = eventData?.payment;

      const cashfreeOrderId = orderData?.order_id as string;
      const cfPaymentId = paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : undefined;
      const method = paymentData?.payment_group || (paymentData?.payment_method ? JSON.stringify(paymentData.payment_method) : undefined);

      if (!cashfreeOrderId) {
        return Response.json({ ok: true });
      }

      // Update payment record
      const payment = await handleWebhookCashfreeEvent(
        eventType,
        cashfreeOrderId,
        cfPaymentId,
        method,
      );

      if (!payment) {
        logger.error("Cashfree webhook: payment record not found", { cashfreeOrderId }, traceId);
        return Response.json({ ok: true }); // Return 200 to prevent retries for non-existent records
      }

      // Idempotency check: if order already paid, skip finalization
      const order = await Order.findById(payment.orderId);
      if (order && order.status === "paid") {
        logger.info("Cashfree webhook: order already finalized, skipping", { orderId: String(order._id) }, traceId);
        return Response.json({ ok: true });
      }

      // Atomically finalize order (decrement stock, mark paid)
      if (order) {
        await finalizeOrder(String(order._id), traceId);

        // Send confirmation email asynchronously
        sendOrderConfirmation({
          email: order.email,
          orderNumber: order.orderNumber,
          items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, lineTotal: i.lineTotal })),
          grandTotal: order.grandTotal,
          shippingAddress: order.shippingAddress,
        }).catch((err) => {
          logger.warn("Order confirmation email failed to send", { orderNumber: order.orderNumber, error: String(err) });
        });

        logger.info("Order finalized via Cashfree webhook", { orderNumber: order.orderNumber, cashfreeOrderId }, traceId);
      }
    } else if (eventType === "PAYMENT_FAILED_WEBHOOK" || eventType === "PAYMENT_USER_DROPPED_WEBHOOK") {
      const cashfreeOrderId = eventData?.order?.order_id as string;
      const cfPaymentId = eventData?.payment?.cf_payment_id ? String(eventData.payment.cf_payment_id) : undefined;

      if (cashfreeOrderId) {
        await handleWebhookCashfreeEvent(eventType, cashfreeOrderId, cfPaymentId);

        const payment = await Payment.findOne({
          $or: [{ cashfreeOrderId }, { cfOrderId: cashfreeOrderId }],
        });

        if (payment) {
          await Order.updateOne(
            { _id: payment.orderId },
            {
              $push: {
                timeline: {
                  at: new Date(),
                  status: "payment_failed",
                  note: eventType === "PAYMENT_USER_DROPPED_WEBHOOK" ? "Customer dropped checkout" : "Payment failed at gateway",
                },
              },
            },
          );
        }
        logger.info("Payment failed/dropped webhook processed", { cashfreeOrderId, eventType }, traceId);
      }
    } else if (eventType === "REFUND_STATUS_WEBHOOK") {
      const refund = eventData?.refund;
      if (refund) {
        const cashfreeOrderId = refund.order_id as string;
        const cfRefundId = String(refund.cf_refund_id || refund.refund_id);
        const refundAmountRupees = Number(refund.refund_amount || 0);
        const refundAmountPaise = Math.round(refundAmountRupees * 100);
        const refundStatus = refund.refund_status as string;

        const payment = await Payment.findOne({
          $or: [{ cashfreeOrderId }, { cfOrderId: cashfreeOrderId }],
        });

        if (payment) {
          const existingRefund = payment.refunds.find((r) => r.refundId === cfRefundId);
          if (existingRefund) {
            existingRefund.status = refundStatus;
          } else {
            payment.refunds.push({
              refundId: cfRefundId,
              amount: refundAmountPaise,
              status: refundStatus,
              at: new Date(),
            });
          }

          if (refundStatus === "SUCCESS") {
            payment.status = refundAmountPaise >= payment.amount ? "refunded" : "partially_refunded";
          }
          await payment.save();

          await Order.updateOne(
            { _id: payment.orderId },
            {
              paymentStatus: payment.status,
              $push: {
                timeline: {
                  at: new Date(),
                  status: "refund_update",
                  note: `Refund status: ${refundStatus} for ₹${refundAmountRupees.toFixed(0)}`,
                },
              },
            },
          );
        }
        logger.info("Refund status webhook processed", { cashfreeOrderId, cfRefundId, refundStatus }, traceId);
      }
    }

    // Always return HTTP 200 to acknowledge webhook
    return Response.json({ ok: true });
  } catch (error) {
    logger.error("Cashfree webhook processing error", { error: String(error) }, traceId);
    return Response.json({ ok: true });
  }
}
