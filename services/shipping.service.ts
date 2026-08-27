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
  if (order.shiprocketOrderId && order.shiprocketShipmentId) {
    return {
      shiprocketOrderId: order.shiprocketOrderId,
      shipmentId: order.shiprocketShipmentId,
    };
  }

  if (order.shiprocketOrderId) {
    const existingResponse = await shiprocketFetch(`/orders/show/${order.shiprocketOrderId}`, {
      method: "GET",
    });
    if (!existingResponse.ok) {
      throw new Error(`Unable to recover Shiprocket shipment: ${existingResponse.status}`);
    }

    const existing = (await existingResponse.json()) as {
      data?: { shipments?: Array<{ id?: string | number }> };
    };
    const existingShipmentId = existing.data?.shipments?.[0]?.id;
    if (!existingShipmentId) {
      throw new Error("Existing Shiprocket order has no shipment ID");
    }

    order.shiprocketShipmentId = String(existingShipmentId);
    await order.save();
    return {
      shiprocketOrderId: order.shiprocketOrderId,
      shipmentId: order.shiprocketShipmentId,
    };
  }

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
    order.shiprocketShipmentId = String(data.shipment_id);
    order.status = "processing";
    order.fulfillmentStatus = "processing";
    order.timeline.push({ 
      at: new Date(), 
      status: "shipment_created", 
      note: "Your order is being processed for shipping." 
    });
    await order.save();

    logger.info("Shiprocket shipment created", {
      orderNumber,
      shiprocketOrderId: data.order_id,
      shiprocketShipmentId: data.shipment_id,
    });
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
  if (!order || !order.shiprocketShipmentId) throw new Error("Shiprocket shipment not found");
  if (order.awbCode) return { awbCode: order.awbCode }; // idempotent

  try {
    const res = await shiprocketFetch("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify({ shipment_id: order.shiprocketShipmentId }),
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

    if (!awbCode) {
      throw new Error("Shiprocket did not return an AWB code");
    }

    order.awbCode = awbCode;
    order.courierName = courierName;
    order.trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
    order.fulfillmentStatus = "processing";
    order.timeline.push({ 
      at: new Date(), 
      status: "awb_generated", 
      note: `Your order has been assigned to ${courierName}. You can track it using AWB: ${awbCode}.` 
    });
    await order.save();

    logger.info("AWB generated", { orderNumber, awbCode, courierName });
    return { awbCode, courierName, trackingUrl: order.trackingUrl };
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
  sr_order_id?: string | number;
  awb?: string;
  current_status?: string;
  current_status_id?: number;
  shipment_status_id?: number;
}) {
  await connectDB();

  const { order_id, sr_order_id, awb, current_status, current_status_id, shipment_status_id } = payload;
  const statusId = shipment_status_id ?? current_status_id;
  const orderLookup: Record<string, string>[] = [];

  if (order_id) orderLookup.push({ orderNumber: order_id });
  if (sr_order_id) orderLookup.push({ shiprocketOrderId: String(sr_order_id) });
  if (awb) orderLookup.push({ awbCode: awb });

  if (orderLookup.length === 0) {
    logger.warn("Shiprocket webhook has no order identifier");
    return;
  }

  const order = await Order.findOne({ $or: orderLookup });

  if (!order) {
    logger.warn("Shiprocket webhook: order not found", { order_id, awb });
    return;
  }

  // Customer-friendly status mapping based on Shiprocket status IDs
  let friendlyNote = "Your order update is available.";
  let userStatus = "order_updated";

  switch (statusId) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 19:
      friendlyNote = "Your order is packed and being prepared for courier pickup.";
      userStatus = "preparing_shipment";
      break;
    case 42:
      friendlyNote = "Your order has been picked up by the courier.";
      userStatus = "picked_up";
      break;
    case 6:
      friendlyNote = "Your order has been shipped.";
      userStatus = "shipped";
      break;
    case 18:
    case 20:
    case 38:
    case 50:
      friendlyNote = "Your order is in transit and on its way to you.";
      userStatus = "in_transit";
      break;
    case 17:
      friendlyNote = "Your order is out for delivery and should arrive today.";
      userStatus = "out_for_delivery";
      break;
    case 7:
      friendlyNote = "Your order has been delivered. We hope you love it.";
      userStatus = "delivered";
      break;
    case 8:
    case 16:
    case 45:
      friendlyNote = "Your shipment has been cancelled. Please contact us if you need help.";
      userStatus = "cancelled";
      break;
    case 9:
    case 10:
    case 14:
    case 46:
      friendlyNote = "The shipment is being returned to us. Please contact us for assistance.";
      userStatus = "return_to_origin";
      break;
    case 21:
      friendlyNote = "The courier could not complete delivery. Another attempt may be scheduled.";
      userStatus = "delivery_attempt_failed";
      break;
    case 22:
      friendlyNote = "Your delivery is delayed, but the shipment is still on its way.";
      userStatus = "delayed";
      break;
    case 12:
    case 24:
    case 25:
      friendlyNote = "There is an issue with this shipment. Our team will contact you if action is needed.";
      userStatus = "shipping_exception";
      break;
    default:
      if (current_status) {
        const readableStatus = current_status.toLowerCase().replace(/_/g, " ");
        friendlyNote = `Shipping update: ${readableStatus}.`;
      }
      break;
  }

  let fulfillmentStatus: typeof order.fulfillmentStatus | undefined;
  let orderStatus: typeof order.status | undefined;

  if ([1, 2, 3, 4, 5, 19].includes(statusId ?? -1)) {
    fulfillmentStatus = "processing";
    orderStatus = "processing";
  } else if ([6, 17, 18, 20, 21, 22, 38, 42, 50].includes(statusId ?? -1)) {
    fulfillmentStatus = "shipped";
    orderStatus = "shipped";
  } else if (statusId === 7) {
    fulfillmentStatus = "delivered";
    orderStatus = "delivered";
  } else if ([8, 16, 45].includes(statusId ?? -1)) {
    fulfillmentStatus = "cancelled";
    orderStatus = "cancelled";
  }

  if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
  if (orderStatus) order.status = orderStatus;

  const latestEvent = order.timeline.at(-1);
  if (latestEvent?.status !== userStatus || latestEvent.note !== friendlyNote) {
    order.timeline.push({
      at: new Date(),
      status: userStatus,
      note: friendlyNote,
    });
  }

  if (awb && !order.awbCode) {
    order.awbCode = awb;
    order.trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  }

  await order.save();
  logger.info("Shiprocket webhook processed", {
    orderNumber: order.orderNumber,
    currentStatus: userStatus,
    statusId,
  });
}
