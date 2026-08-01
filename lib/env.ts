import { z } from "zod";

/**
 * Server-side environment variables validated at boot.
 * If any required variable is missing, the app fails fast with a clear message.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB: z.string().min(1, "MONGODB_DB is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.string().optional().default("false"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("The Silver Button <enquiry@silverbutton.in>"),
  SHIPROCKET_EMAIL: z.string().optional().default(""),
  SHIPROCKET_PASSWORD: z.string().optional().default(""),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD: z.string().min(6, "ADMIN_PASSWORD must be at least 6 chars"),
});

/**
 * Client-side (public) environment variables.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  const serverResult = serverSchema.safeParse(process.env);
  if (!serverResult.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(serverResult.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables. Check the logs above.");
  }

  const clientResult = clientSchema.safeParse(process.env);
  if (!clientResult.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(clientResult.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check the logs above.");
  }

  return {
    server: serverResult.data,
    client: clientResult.data,
  };
}

const env = validateEnv();

export const serverEnv = env.server;
export const clientEnv = env.client;
