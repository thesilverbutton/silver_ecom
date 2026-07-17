import { Resend } from "resend";

let instance: Resend | null = null;

/**
 * Get a Resend client. Lazily created so key can be empty in dev.
 */
export function getResend(): Resend {
  if (!instance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    instance = new Resend(apiKey);
  }
  return instance;
}
