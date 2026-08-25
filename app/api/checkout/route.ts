import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCart } from "@/services/cart.service";
import { createOrder } from "@/services/order.service";
import { createCashfreeOrder } from "@/services/payment.service";
import { Order } from "@/models/order.model";
import { generateTraceId, logger } from "@/lib/logger";
import { errorToResponse, getStatusFromError, ValidationError } from "@/lib/errors";

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(10),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(6),
    country: z.string().default("India"),
  }),
});

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    await connectDB();

    // Get session to link order to customer if logged in
    let customerId: string | undefined;
    try {
      const session = await auth();
      customerId = session?.user?.id || undefined;
    } catch {
      // Session resolution failed — proceed as guest
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid checkout data");
    }

    // Get cart from cookie
    const cookieStore = await cookies();
    const cartId = cookieStore.get("tsb_cart_id")?.value;
    if (!cartId) {
      throw new ValidationError("No cart found");
    }

    // Revalidate cart (live prices + stock)
    const cart = await getCart(cartId);
    if (cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }
    if (!cart.valid) {
      return Response.json(
        { ok: false, error: { code: "CART_INVALID", message: "Cart has issues. Please resolve before checkout.", traceId } },
        { status: 409 },
      );
    }
    if (cart.totals.grandTotal < 100) {
      throw new ValidationError("Minimum order amount is ₹1");
    }

    // Create order
    const order = await createOrder({
      cart,
      email: parsed.data.email,
      phone: parsed.data.phone,
      shippingAddress: parsed.data.shippingAddress,
      customerId,
    });

    // Create Cashfree order
    const cfOrder = await createCashfreeOrder(
      String(order._id),
      cart.totals.grandTotal,
      order.orderNumber,
      {
        name: parsed.data.shippingAddress.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
      },
    );

    // Link payment to order
    await Order.updateOne({ _id: order._id }, { paymentId: cfOrder.paymentId });

    logger.info("Checkout initiated", {
      orderNumber: order.orderNumber,
      cashfreeOrderId: cfOrder.cashfreeOrderId,
      cfOrderId: cfOrder.cfOrderId,
      amount: cfOrder.amount,
    }, traceId);

    return Response.json({
      ok: true,
      data: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        cashfreeOrderId: cfOrder.cashfreeOrderId,
        paymentSessionId: cfOrder.paymentSessionId,
        amount: cfOrder.amount,
        currency: cfOrder.currency,
        mode: cfOrder.mode,
      },
    });
  } catch (error) {
    logger.error("Checkout error", { error: String(error) }, traceId);
    return Response.json(errorToResponse(error, traceId), { status: getStatusFromError(error) });
  }
}
