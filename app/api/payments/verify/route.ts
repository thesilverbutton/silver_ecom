import { NextRequest } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature, markPaymentVerified } from "@/services/payment.service";
import { generateTraceId, logger } from "@/lib/logger";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature from the client callback.
 * This does NOT finalize the order — that happens via the webhook.
 */
export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { code: "VALIDATION", message: "Missing payment fields", traceId } },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // Verify HMAC signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      logger.error("Payment signature verification failed", { razorpay_order_id, razorpay_payment_id }, traceId);
      return Response.json(
        { ok: false, error: { code: "SIGNATURE_INVALID", message: "Payment verification failed", traceId } },
        { status: 400 },
      );
    }

    // Update payment record (provisional — does NOT mark order as paid)
    await markPaymentVerified(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    logger.info("Payment verified (client)", { razorpay_order_id, razorpay_payment_id }, traceId);

    return Response.json({ ok: true, data: { verified: true } });
  } catch (error) {
    logger.error("Payment verify error", { error: String(error) }, traceId);
    return Response.json(
      { ok: false, error: { code: "INTERNAL", message: "Verification failed", traceId } },
      { status: 500 },
    );
  }
}
