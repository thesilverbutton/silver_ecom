import { Cashfree, CFEnvironment } from "cashfree-pg";
import { logger } from "@/lib/logger";

let instance: Cashfree | null = null;

/**
 * Determine Cashfree environment mode ("sandbox" | "production").
 */
export function getCashfreeMode(): "sandbox" | "production" {
  const envVar = (process.env.CASHFREE_ENV || "").toUpperCase();
  if (envVar === "PRODUCTION") return "production";
  if (envVar === "SANDBOX") return "sandbox";

  // Check if secret key starts with cfsk_ma_prod_
  const secretKey = process.env.CASHFREE_SECRET_KEY || "";
  const appId = process.env.CASHFREE_APP_ID || "";
  if (secretKey.startsWith("cfsk_ma_test_") || appId.startsWith("TEST")) {
    return "sandbox";
  }
  if (secretKey.startsWith("cfsk_ma_prod_")) {
    return "production";
  }

  return process.env.NODE_ENV === "production" ? "production" : "sandbox";
}

/**
 * Get Cashfree SDK instance.
 */
export function getCashfree(): Cashfree {
  if (!instance) {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      throw new Error("Cashfree credentials not configured (CASHFREE_APP_ID / CASHFREE_SECRET_KEY)");
    }

    const mode = getCashfreeMode();
    const cfEnv = mode === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    instance = new Cashfree(cfEnv, appId, secretKey);
    // Pin to published v5 API contract
    instance.XApiVersion = "2025-01-01";

    logger.info("Cashfree SDK initialized", { mode, appId: appId.slice(0, 6) + "..." });
  }

  return instance;
}
