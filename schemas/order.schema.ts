import { z } from "zod";
import { addressSchema } from "./customer.schema";

export const orderAddressSchema = addressSchema.omit({ isDefault: true, label: true });

export const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  shippingAddress: orderAddressSchema,
  billingAddress: orderAddressSchema.optional(),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
