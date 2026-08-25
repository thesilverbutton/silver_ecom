import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";

const trackSchema = z.object({
  orderNumber: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { message: "Please provide a valid order number and email" } },
        { status: 400 },
      );
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber: parsed.data.orderNumber,
      email: parsed.data.email.toLowerCase(),
    })
      .select("orderNumber status paymentStatus fulfillmentStatus grandTotal items shippingAddress createdAt timeline courierName awbCode")
      .lean();

    if (!order) {
      return Response.json(
        { ok: false, error: { message: "Order not found. Please check your order number and email." } },
        { status: 404 },
      );
    }

    return Response.json({ ok: true, data: order });
  } catch {
    return Response.json(
      { ok: false, error: { message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
