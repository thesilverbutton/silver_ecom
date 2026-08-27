import { Order } from "@/models/order.model";
import { sendOrderConfirmation } from "@/services/email.service";
import { finalizeOrder } from "@/services/order.service";
import { createShipment, generateAWB } from "@/services/shipping.service";
import { logger } from "@/lib/logger";

export async function processPaidOrder(orderId: string, traceId?: string) {
  const { newlyFinalized } = await finalizeOrder(orderId, traceId);
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found after payment finalization");

  if (newlyFinalized) {
    sendOrderConfirmation({
      email: order.email,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      grandTotal: order.grandTotal,
      shippingAddress: order.shippingAddress,
    }).catch((error) => {
      logger.warn("Order confirmation email failed to send", {
        orderNumber: order.orderNumber,
        error: String(error),
      });
    });
  }

  try {
    await createShipment(order.orderNumber);
    await generateAWB(order.orderNumber);
  } catch (error) {
    logger.error("Paid order shipping setup failed", {
      orderNumber: order.orderNumber,
      error: String(error),
    }, traceId);
  }

  return { orderNumber: order.orderNumber, newlyFinalized };
}