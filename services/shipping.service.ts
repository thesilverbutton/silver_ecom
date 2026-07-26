import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { shiprocketFetch } from "@/lib/shiprocket";
import { logger } from "@/lib/logger";

/**
 * Create a Shiprocket order from a paid order.
 * Called post-payment (webhook) or by admin action.
 */
export async function createShipment(orderNumber: string) {
  await connectDB();

  const order = await Order.findOne({ orderNumber });
  if (!order) throw new Error("Order not found");
  if (order.shiprocketOrderId) return { shiprocketOrderId: order.shiprocketOrderId }; // idempotent

  const payload = {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: order.shippingAddress.fullName.split(" ")[0],
    billing_last_name: order.shippingAddress.fullName.split(" ").slice(1).join(" ") || "",
    billing_address: order.shippingAddress.line1,
    billing_address_2: order.shippingAddress.line2 || "",
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country || "India",
    billing_email: order.email,
    billing_phone: order.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.title,
      sku: item.sku || `SKU-${item.productId}`,
      units: item.quantity,
      selling_price: (item.unitPrice / 100).toFixed(2),
      discount: "0",
      tax: "0",
    })),
    payment_method: "Prepaid",
    sub_total: (order.grandTotal / 100).toFixed(2),
    length: 30,
    breadth: 20,
    height: 10,
    weight: 0.5,
  };

  try {
    const res = await shiprocketFetch("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.error("Shiprocket order creation failed", { orderNumber, status: res.status, errBody });
      throw new Error(`Shiprocket error: ${res.status}`);
    }

    const data = (await res.json()) as { order_id: string; shipment_id: string };

    order.shiprocketOrderId = String(data.order_id);
    order.timeline.push({ at: new Date(), status: "shipment_created", note: `Shiprocket order ${data.order_id}` });
    await order.save();

    logger.info("Shiprocket shipment created", { orderNumber, shiprocketOrderId: data.order_id });
    return { shiprocketOrderId: data.order_id, shipmentId: data.shipment_id };
  } catch (err) {
    logger.error("Shiprocket createShipment error", { orderNumber, error: String(err) });
    throw err;
  }
}

/**
 * Generate AWB (assign courier) for an existing Shiprocket shipment.
 */
export async function generateAWB(orderNumber: string) {
  await connectDB();

  const order = await Order.findOne({ orderNumber });
  if (!order || !order.shiprocketOrderId) throw new Error("Shiprocket order not found");
  if (order.awbCode) return { awbCode: order.awbCode }; // idempotent

  try {
    const res = await shiprocketFetch("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify({ shipment_id: order.shiprocketOrderId }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.error("AWB generation failed", { orderNumber, errBody });
      throw new Error(`AWB error: ${res.status}`);
    }

    const data = (await res.json()) as {
      response: { data: { awb_code: string; courier_name: string } };
    };

    const awbCode = data.response?.data?.awb_code;
    const courierName = data.response?.data?.courier_name;

    if (awbCode) {
      order.awbCode = awbCode;
      order.courierName = courierName;
      order.fulfillmentStatus = "processing";
      order.timeline.push({ at: new Date(), status: "awb_generated", note: `AWB: ${awbCode} (${courierName})` });
      await order.save();
    }

    logger.info("AWB generated", { orderNumber, awbCode, courierName });
    return { awbCode, courierName };
  } catch (err) {
    logger.error("AWB generation error", { orderNumber, error: String(err) });
    throw err;
  }
}

/**
 * Get tracking info for an order.
 */
export async function getTracking(orderNumber: string) {
  await connectDB();

  const order = await Order.findOne({ orderNumber });
  if (!order || !order.awbCode) return null;

  try {
    const res = await shiprocketFetch(`/courier/track/awb/${order.awbCode}`, { method: "GET" });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

/**
 * Get label/invoice for a shipment.
 */
export async function getLabel(orderNumber: string) {
  await connectDB();

  const order = await Order.findOne({ orderNumber });
  if (!order || !order.shiprocketOrderId) return null;

  try {
    const res = await shiprocketFetch("/orders/print/invoice", {
      method: "POST",
      body: JSON.stringify({ ids: [order.shiprocketOrderId] }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { invoice_url?: string };
    return data.invoice_url || null;
  } catch {
    return null;
  }
}

/**
 * Handle Shiprocket webhook status update.
 */
export async function handleShiprocketWebhook(payload: {
  order_id?: string;
  awb?: string;
  current_status?: string;
  current_status_id?: number;
}) {
  await connectDB();

  const { order_id, awb, current_status, current_status_id } = payload;

  const order = await Order.findOne({
    $or: [{ orderNumber: order_id }, { awbCode: awb }],
  });

  if (!order) {
    logger.warn("Shiprocket webhook: order not found", { order_id, awb });
    return;
  }

  // Map Shiprocket status to our fulfillment status
  let fulfillmentStatus: string | undefined;
  if (current_status_id === 6 || current_status_id === 7) {
    fulfillmentStatus = "shipped";
  } else if (current_status_id === 8) {
    fulfillmentStatus = "delivered";
  } else if (current_status_id === 9 || current_status_id === 10) {
    fulfillmentStatus = "cancelled";
  }

  if (fulfillmentStatus) {
    order.fulfillmentStatus = fulfillmentStatus as typeof order.fulfillmentStatus;
    if (fulfillmentStatus === "delivered") {
      order.status = "delivered";
    }
  }

  order.timeline.push({
    at: new Date(),
    status: current_status || "shiprocket_update",
    note: `Shiprocket: ${current_status} (ID: ${current_status_id})`,
  });

  if (awb && !order.awbCode) {
    order.awbCode = awb;
  }

  await order.save();
  logger.info("Shiprocket webhook processed", { orderNumber: order.orderNumber, current_status });
}
