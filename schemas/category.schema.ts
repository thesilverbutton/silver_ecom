import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(slugRegex, "Invalid slug format"),
  description: z.string().optional(),
  image: z
    .object({
      url: z.string().url(),
      publicId: z.string().min(1),
      alt: z.string().min(1),
    })
    .optional(),
  parentId: z.string().optional(),
  kind: z.enum(["category", "collection"]).default("category"),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seo: z
    .object({
      title: z.string().max(160).optional(),
      description: z.string().max(320).optional(),
    })
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
