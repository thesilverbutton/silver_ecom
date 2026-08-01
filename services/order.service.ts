"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { logger } from "@/lib/logger";
import type { ResolvedCart } from "@/services/cart.service";

/**
 * Generate a human-friendly order number: TSB-YYYYMMDD-XXXX
 */
export async function generateOrderNumber(): Promise<string> {
  await connectDB();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Order.countDocuments({
    createdAt: { $gte: new Date(today.toISOString().slice(0, 10)) },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `TSB-${dateStr}-${seq}`;
}

interface CreateOrderInput {
  cart: ResolvedCart;
  email: string;
  phone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  customerId?: string;
}

/**
 * Create a pending order from a validated cart.
 * Snapshots prices at purchase time. Does NOT decrement stock yet.
 */
export async function createOrder(input: CreateOrderInput) {
  await connectDB();

  const orderNumber = await generateOrderNumber();

  const items = input.cart.items
    .filter((i) => !i.flag || i.flag === "QTY_REDUCED")
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      sku: undefined,
      title: item.title,
      image: item.image,
      options: item.options,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }));

  const order = await Order.create({
    orderNumber,
    customerId: input.customerId || undefined,
    isGuest: !input.customerId,
    email: input.email,
    phone: input.phone,
    items,
    shippingAddress: input.shippingAddress,
    subtotal: input.cart.totals.subtotal,
    discountTotal: input.cart.totals.discountTotal,
    shippingTotal: input.cart.totals.shippingTotal,
    taxTotal: input.cart.totals.taxTotal,
    grandTotal: input.cart.totals.grandTotal,
    currency: "INR",
    status: "pending",
    paymentStatus: "unpaid",
    fulfillmentStatus: "unfulfilled",
    timeline: [{ at: new Date(), status: "pending", note: "Order created" }],
  });

  logger.info("Order created", { orderNumber, orderId: String(order._id) });
  return order;
}

/**
 * Finalize an order after payment is confirmed via webhook.
 * Atomically decrements inventory. Returns oversold items if any.
 */
export async function finalizeOrder(orderId: string, traceId?: string) {
  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "paid") return { success: true, oversold: [] }; // idempotent

  const oversold: string[] = [];

  // Atomic inventory decrement per line item
  for (const item of order.items) {
    if (item.variantId) {
      // Variant stock decrement
      const res = await Product.updateOne(
        {
          _id: item.productId,
          "variants._id": item.variantId,
          "variants.stock": { $gte: item.quantity },
        },
        { $inc: { "variants.$.stock": -item.quantity } },
      );
      if (res.matchedCount === 0) {
        oversold.push(`${item.title} (variant)`);
      }
    } else {
      // Simple product stock decrement
      const res = await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
      if (res.matchedCount === 0) {
        oversold.push(item.title);
      }
    }
  }

  // Update order status
  order.status = "paid";
  order.paymentStatus = "paid";
  order.timeline.push({ at: new Date(), status: "paid", note: "Payment confirmed via webhook" });

  if (oversold.length > 0) {
    order.notes = `needs_review:oversold - ${oversold.join(", ")}`;
    logger.warn("Order has oversold items", { orderId, oversold }, traceId);
  }

  await order.save();
  logger.info("Order finalized", { orderId, orderNumber: order.orderNumber, oversold }, traceId);

  return { success: true, oversold };
}

// ─── Customer-facing queries ────────────────────────────────────────────────

interface PaginationOpts {
  page?: number;
  limit?: number;
}

/**
 * Get orders for a customer (by customerId).
 */
export async function getOrdersForCustomer(customerId: string, opts: PaginationOpts = {}) {
  await connectDB();
  const { page = 1, limit = 10 } = opts;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("orderNumber status paymentStatus fulfillmentStatus grandTotal items createdAt")
      .lean(),
    Order.countDocuments({ customerId }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

/**
 * Get orders by email (for guest order lookup).
 */
export async function getOrdersByEmail(email: string, opts: PaginationOpts = {}) {
  await connectDB();
  const { page = 1, limit = 10 } = opts;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("orderNumber status paymentStatus fulfillmentStatus grandTotal items createdAt")
      .lean(),
    Order.countDocuments({ email: email.toLowerCase() }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

/**
 * Get a single order by order number.
 * Enforces ownership if customerId provided.
 */
export async function getOrderByNumber(orderNumber: string, customerId?: string) {
  await connectDB();

  const query: Record<string, unknown> = { orderNumber };
  if (customerId) query.customerId = customerId;

  return Order.findOne(query).lean();
}

/**
 * Cancel an order. Allowed states: pending, paid, processing.
 * If paid, initiates refund + restock.
 */
export async function cancelOrder(
  orderNumber: string,
  reason: string,
  customerId?: string,
): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  const query: Record<string, unknown> = { orderNumber };
  if (customerId) query.customerId = customerId;

  const order = await Order.findOne(query);
  if (!order) return { success: false, error: "Order not found" };

  const cancellableStatuses = ["pending", "paid", "processing"];
  if (!cancellableStatuses.includes(order.status)) {
    return { success: false, error: `Cannot cancel order in '${order.status}' state` };
  }

  // Check return window (7 days from creation)
  const daysSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > 7) {
    return { success: false, error: "Cancellation window (7 days) has passed" };
  }

  order.status = "cancelled";
  order.cancelledReason = reason;
  order.timeline.push({ at: new Date(), status: "cancelled", note: `Cancelled: ${reason}` });

  // If paid, restock items
  if (order.paymentStatus === "paid") {
    for (const item of order.items) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.productId, "variants._id": item.variantId },
          { $inc: { "variants.$.stock": item.quantity } },
        );
      } else {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
        );
      }
    }
    order.timeline.push({ at: new Date(), status: "restocked", note: "Inventory restocked after cancellation" });
  }

  await order.save();
  logger.info("Order cancelled", { orderNumber, reason });
  return { success: true };
}

/**
 * Initiate a refund via Razorpay.
 * Used by admin (Phase 7). Returns the refund result.
 */
export async function refundOrder(
  orderNumber: string,
  amount?: number, // paise; undefined = full refund
): Promise<{ success: boolean; error?: string }> {
  await connectDB();
  const { Payment } = await import("@/models/payment.model");
  const { getRazorpay } = await import("@/lib/razorpay");

  const order = await Order.findOne({ orderNumber });
  if (!order) return { success: false, error: "Order not found" };
  if (order.paymentStatus !== "paid") return { success: false, error: "Order not paid" };

  const payment = await Payment.findOne({ orderId: order._id, status: "captured" });
  if (!payment || !payment.razorpayPaymentId) {
    return { success: false, error: "No captured payment found" };
  }

  const refundAmount = amount || order.grandTotal;
  const razorpay = getRazorpay();

  try {
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmount,
    });

    payment.refunds.push({
      refundId: refund.id,
      amount: refundAmount,
      status: "processed",
      at: new Date(),
    });
    payment.status = refundAmount >= payment.amount ? "refunded" : "partially_refunded";
    await payment.save();

    order.paymentStatus = payment.status;
    order.status = "refunded";
    order.timeline.push({
      at: new Date(),
      status: "refunded",
      note: `Refund ₹${(refundAmount / 100).toFixed(0)} initiated`,
    });
    await order.save();

    logger.info("Refund initiated", { orderNumber, refundId: refund.id, amount: refundAmount });
    return { success: true };
  } catch (err) {
    logger.error("Refund failed", { orderNumber, error: String(err) });
    return { success: false, error: "Refund failed. Try again or contact Razorpay." };
  }
}
