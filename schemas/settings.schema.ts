import { z } from "zod";

export const updateSettingsSchema = z.object({
  storeName: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional(),
  gstEnabled: z.boolean().optional(),
  gstPercent: z.number().min(0).max(100).optional(),
  freeShippingThreshold: z.number().int().min(0).optional(),
  flatShippingRate: z.number().int().min(0).optional(),
  codEnabled: z.boolean().optional(),
  returnWindowDays: z.number().int().min(0).optional(),
  originPincode: z.string().regex(/^[1-9][0-9]{5}$/).optional(),
  socials: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      whatsapp: z.string().optional(),
    })
    .optional(),
  announcementBar: z
    .object({
      text: z.string(),
      isActive: z.boolean(),
    })
    .optional(),
  policies: z
    .object({
      shipping: z.string().optional(),
      returns: z.string().optional(),
      privacy: z.string().optional(),
      terms: z.string().optional(),
    })
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
