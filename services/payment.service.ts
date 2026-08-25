import { createHmac } from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/payment.model";
import { Order } from "@/models/order.model";
import { getCashfree, getCashfreeMode } from "@/lib/cashfree";
import { finalizeOrder } from "@/services/order.service";
import { sendOrderConfirmation } from "@/services/email.service";
import { logger } from "@/lib/logger";
import { PaymentError } from "@/lib/errors";

function sanitizePhone(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return "9999999999";
}

function sanitizeCustomerId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "customer_guest";
}

function isMongoObjectId(val?: string): boolean {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(val) && mongoose.Types.ObjectId.isValid(val);
}

interface CustomerPayload {
  name?: string;
  email: string;
  phone: string;
}

/**
 * Create a Cashfree order and a Payment record.
 */
export async function createCashfreeOrder(
  orderId: string,
  amountPaise: number,
  orderNumber: string,
  customer: CustomerPayload,
) {
  await connectDB();
  const cashfree = getCashfree();

  // Convert paise to rupees (decimal) — minimum ₹1.00
  const orderAmountRupees = Math.max(Number((amountPaise / 100).toFixed(2)), 1.0);

  // Generate unique alphanumeric Cashfree order ID
  const sanitizedOrderNumber = orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 35);
  const cashfreeOrderId = `${sanitizedOrderNumber}_${Date.now().toString().slice(-6)}`;

  const envUrl = process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000" 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
      "http://localhost:3000";
      
  const appUrl = envUrl.replace(/\/$/, "");

  const request = {
    order_id: cashfreeOrderId,
    order_amount: orderAmountRupees,
    order_currency: "INR",
    customer_details: {
      customer_id: sanitizeCustomerId(customer.email || orderId),
      customer_phone: sanitizePhone(customer.phone),
      customer_email: customer.email || "customer@thesilverbutton.com",
      customer_name: customer.name || "Valued Customer",
    },
    order_meta: {
      return_url: `${appUrl}/checkout/success?order=${orderNumber}&order_id={order_id}`,
      notify_url: `${appUrl}/api/webhooks/cashfree`,
    },
    order_note: `Order ${orderNumber}`,
  };

  let response;
  try {
    response = await cashfree.PGCreateOrder(request);
  } catch (error) {
    const err = error as { message?: string; response?: { data?: { message?: string } } };
    logger.error("Cashfree PGCreateOrder failed", { 
      message: err.message, 
      data: err.response?.data 
    });
    
    // Throw a PaymentError which is exposed to the client
    const cfMessage = err.response?.data?.message || err.message || "Unknown error";
    throw new PaymentError(`Cashfree API Error: ${cfMessage}`);
  }

  const cfData = response.data;

  // Create payment record in database
  const payment = await Payment.create({
    orderId: new mongoose.Types.ObjectId(orderId),
    provider: "cashfree",
    cashfreeOrderId: cfData.order_id,
    cfOrderId: cfData.cf_order_id ? String(cfData.cf_order_id) : undefined,
    paymentSessionId: cfData.payment_session_id,
    amount: amountPaise,
    currency: "INR",
    status: "created",
    webhookEvents: [],
    refunds: [],
  });

  logger.info("Cashfree order created", {
    cashfreeOrderId: cfData.order_id,
    cfOrderId: cfData.cf_order_id,
    orderId,
    amountPaise,
    amountRupees: orderAmountRupees,
  });

  return {
    cashfreeOrderId: cfData.order_id,
    cfOrderId: cfData.cf_order_id ? String(cfData.cf_order_id) : undefined,
    paymentSessionId: cfData.payment_session_id,
    amount: amountPaise,
    currency: "INR",
    paymentId: String(payment._id),
    mode: getCashfreeMode(),
  };
}



/**
 * Verify Cashfree payment status on the backend using PGFetchOrder.
 * Fulfills the rule: Never trust client-side callbacks, always re-fetch order status from server.
 */
export async function verifyCashfreePayment(orderIdOrNumber: string) {
  await connectDB();
  const cashfree = getCashfree();

  // Safely construct query conditions without triggering ObjectId CastError
  const orConditions: Record<string, unknown>[] = [
    { cashfreeOrderId: orderIdOrNumber },
    { cfOrderId: orderIdOrNumber },
  ];

  if (isMongoObjectId(orderIdOrNumber)) {
    orConditions.push({ orderId: new mongoose.Types.ObjectId(orderIdOrNumber) });
  }

  let payment = await Payment.findOne({ $or: orConditions });

  // If not directly found on payment, try resolving orderId from Order collection by orderNumber
  if (!payment) {
    const orderQuery: Record<string, unknown>[] = [{ orderNumber: orderIdOrNumber }];
    if (isMongoObjectId(orderIdOrNumber)) {
      orderQuery.push({ _id: new mongoose.Types.ObjectId(orderIdOrNumber) });
    }
    const order = await Order.findOne({ $or: orderQuery });
    if (order) {
      payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
    }
  }

  if (!payment) {
    logger.warn("Payment record not found for verification", { orderIdOrNumber });
    return { verified: false, status: "NOT_FOUND", payment: null };
  }

  const lookupOrderId = payment.cashfreeOrderId || orderIdOrNumber;
  try {
    const response = await cashfree.PGFetchOrder(lookupOrderId);
    const orderData = response.data;

    const isPaid = orderData.order_status === "PAID";

    if (isPaid) {
      // Fetch payment details to extract cf_payment_id and payment method
      try {
        const paymentsResponse = await cashfree.PGOrderFetchPayments(lookupOrderId);
        const paymentsList = paymentsResponse.data;
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
          const successfulPayment = paymentsList.find((p) => p.payment_status === "SUCCESS") || paymentsList[0];
          if (successfulPayment) {
            payment.cfPaymentId = successfulPayment.cf_payment_id ? String(successfulPayment.cf_payment_id) : undefined;
            payment.method = successfulPayment.payment_group || (successfulPayment.payment_method ? JSON.stringify(successfulPayment.payment_method) : undefined);
          }
        }
      } catch (fetchPaymentErr) {
        logger.warn("Could not fetch payment details for order", { lookupOrderId, error: String(fetchPaymentErr) });
      }

      payment.status = "captured";
      await payment.save();

      // Finalize order atomically and send confirmation email if not yet finalized
      try {
        const order = await Order.findById(payment.orderId);
        if (order && order.status !== "paid") {
          await finalizeOrder(String(order._id));

          sendOrderConfirmation({
            email: order.email,
            orderNumber: order.orderNumber,
            items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, lineTotal: i.lineTotal })),
            grandTotal: order.grandTotal,
            shippingAddress: order.shippingAddress,
          }).catch((err) => {
            logger.warn("Order confirmation email failed to send", { orderNumber: order.orderNumber, error: String(err) });
          });

          logger.info("Order finalized upon server verification", { orderNumber: order.orderNumber, lookupOrderId });
        }
      } catch (finalizeErr) {
        logger.error("Error finalizing order upon payment verification", { lookupOrderId, error: String(finalizeErr) });
      }
    }

    logger.info("Payment verified with Cashfree", {
      lookupOrderId,
      orderStatus: orderData.order_status,
      isPaid,
    });

    return {
      verified: isPaid,
      status: orderData.order_status,
      payment,
    };
  } catch (error) {
    logger.error("Failed to fetch order from Cashfree", { lookupOrderId, error: String(error) });
    return { verified: false, status: "ERROR", payment, error: String(error) };
  }
}

/**
 * Verify Cashfree webhook signature.
 * Formula: HMAC-SHA256(timestamp + rawBody, clientSecret) -> base64
 */
export function verifyWebhookSignature(rawBody: string, signature: string, timestamp: string = ""): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY;

  if (!secret) {
    logger.warn("Webhook secret not set, skipping webhook signature check");
    return true; // In development without secret, allow through
  }

  // Cashfree signature verification: HMAC-SHA256(timestamp + rawBody, secret) -> base64
  const payloadToSign = timestamp ? timestamp + rawBody : rawBody;
  const base64Sig = createHmac("sha256", secret).update(payloadToSign).digest("base64");
  if (base64Sig === signature) return true;

  // Hex fallback for legacy webhooks
  const hexSig = createHmac("sha256", secret).update(rawBody).digest("hex");
  return hexSig === signature;
}

/**
 * Mark payment verified (provisional client-side acknowledgment).
 */
export async function markPaymentVerified(
  orderRef: string,
  cfPaymentId?: string,
) {
  await connectDB();

  const orConditions: Record<string, unknown>[] = [
    { cashfreeOrderId: orderRef },
    { cfOrderId: orderRef },
  ];

  if (isMongoObjectId(orderRef)) {
    orConditions.push({ orderId: new mongoose.Types.ObjectId(orderRef) });
  }

  await Payment.updateOne(
    { $or: orConditions },
    {
      $set: {
        cfPaymentId,
      },
    },
  );

  logger.info("Payment marked verified (client)", { orderRef, cfPaymentId });
}

/**
 * Handle Cashfree webhook events (e.g. PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK, REFUND_STATUS_WEBHOOK).
 */
export async function handleWebhookCashfreeEvent(
  eventType: string,
  cashfreeOrderId: string,
  cfPaymentId?: string,
  method?: string,
) {
  await connectDB();

  const orConditions: Record<string, unknown>[] = [
    { cashfreeOrderId },
    { cfOrderId: cashfreeOrderId },
  ];

  if (isMongoObjectId(cashfreeOrderId)) {
    orConditions.push({ orderId: new mongoose.Types.ObjectId(cashfreeOrderId) });
  }

  const payment = await Payment.findOne({ $or: orConditions });

  if (!payment) {
    logger.error("Webhook: payment not found", { cashfreeOrderId });
    return null;
  }

  // Idempotent — skip if already processed
  if (payment.status === "captured" && (eventType === "PAYMENT_SUCCESS_WEBHOOK" || eventType.includes("captured"))) {
    logger.info("Webhook: already processed", { cashfreeOrderId, eventType });
    return payment;
  }

  // Record webhook event
  payment.webhookEvents.push({ event: eventType, at: new Date(), verified: true });

  if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || eventType === "payment.captured" || eventType === "order.paid") {
    payment.status = "captured";
    if (cfPaymentId) payment.cfPaymentId = String(cfPaymentId);
    if (method) payment.method = method;
  } else if (
    eventType === "PAYMENT_FAILED_WEBHOOK" ||
    eventType === "PAYMENT_USER_DROPPED_WEBHOOK" ||
    eventType === "payment.failed"
  ) {
    payment.status = "failed";
  }

  await payment.save();
  return payment;
}


