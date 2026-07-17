import { z } from "zod";

export const createCouponSchema = z
  .object({
    code: z.string().min(1).max(30).toUpperCase(),
    description: z.string().optional(),
    type: z.enum(["percentage", "fixed", "free_shipping"]),
    value: z.number().positive(),
    minSubtotal: z.number().int().min(0).optional(),
    maxDiscount: z.number().int().positive().optional(),
    appliesTo: z
      .object({
        categoryIds: z.array(z.string()).optional(),
        productIds: z.array(z.string()).optional(),
      })
      .optional(),
    usageLimit: z.number().int().positive().optional(),
    perCustomerLimit: z.number().int().positive().optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type === "percentage") return data.value >= 1 && data.value <= 100;
      return true;
    },
    { message: "Percentage value must be between 1 and 100", path: ["value"] },
  );

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
