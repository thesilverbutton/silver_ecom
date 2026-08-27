import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { verifyCashfreePayment } from "@/services/payment.service";
import { generateTraceId, logger } from "@/lib/logger";

const verifySchema = z.object({
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  cashfreeOrderId: z.string().optional(),
});

/**
 * POST /api/payments/verify
 * Re-fetch order status from Cashfree backend.
 * Never trust client-side success callbacks directly.
 */
export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Please log in to verify payment", traceId } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { code: "VALIDATION", message: "Missing payment order identifier", traceId } },
        { status: 400 },
      );
    }

    const { orderId, orderNumber, cashfreeOrderId } = parsed.data;
    const lookupId = cashfreeOrderId || orderId || orderNumber;

    if (!lookupId) {
      return Response.json(
        { ok: false, error: { code: "VALIDATION", message: "No order identifier provided", traceId } },
        { status: 400 },
      );
    }

    // Server-to-server verification with Cashfree API
    const result = await verifyCashfreePayment(lookupId);

    if (!result.verified) {
      logger.warn("Payment verification status check", { lookupId, status: result.status }, traceId);
      return Response.json(
        {
          ok: false,
          error: {
            code: "PAYMENT_NOT_PAID",
            message: `Payment status is ${result.status}`,
            status: result.status,
            traceId,
          },
        },
        { status: 400 },
      );
    }

    logger.info("Payment successfully verified with Cashfree", { lookupId, status: result.status }, traceId);

    return Response.json({
      ok: true,
      data: {
        verified: true,
        status: result.status,
      },
    });
  } catch (error) {
    logger.error("Payment verify error", { error: String(error) }, traceId);
    return Response.json(
      { ok: false, error: { code: "INTERNAL", message: "Verification failed", traceId } },
      { status: 500 },
    );
  }
}
