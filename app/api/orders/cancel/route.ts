import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { cancelOrder } from "@/services/order.service";
import { generateTraceId, logger } from "@/lib/logger";

const schema = z.object({
  orderNumber: z.string().min(1),
  reason: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ ok: false, error: { message: "Unauthenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: { message: "Invalid input" } }, { status: 400 });
    }

    // cancelOrder checks ownership via customerId; for now use email-based matching
    const result = await cancelOrder(parsed.data.orderNumber, parsed.data.reason, session.user.id);

    if (!result.success) {
      return Response.json({ ok: false, error: { message: result.error } }, { status: 400 });
    }

    logger.info("Order cancelled by customer", { orderNumber: parsed.data.orderNumber }, traceId);
    return Response.json({ ok: true });
  } catch (error) {
    logger.error("Cancel order error", { error: String(error) }, traceId);
    return Response.json({ ok: false, error: { message: "Cancellation failed" } }, { status: 500 });
  }
}
