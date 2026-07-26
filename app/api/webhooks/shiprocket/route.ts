import { NextRequest } from "next/server";
import { handleShiprocketWebhook } from "@/services/shipping.service";
import { generateTraceId, logger } from "@/lib/logger";

/**
 * POST /api/webhooks/shiprocket
 * Receives status updates from Shiprocket and syncs order fulfillment status.
 */
export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const payload = await request.json();
    logger.info("Shiprocket webhook received", { payload: JSON.stringify(payload).slice(0, 500) }, traceId);

    await handleShiprocketWebhook(payload);

    return Response.json({ ok: true });
  } catch (error) {
    logger.error("Shiprocket webhook error", { error: String(error) }, traceId);
    return Response.json({ ok: true }); // Always 200 to avoid retries
  }
}
