import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  position: z.number().int().min(0),
});

export const variantSchema = z.object({
  sku: z.string().min(1),
  options: z.record(z.string(), z.string()),
  priceDelta: z.number().int().default(0),
  stock: z.number().int().min(0),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const productSeoSchema = z.object({
  title: z.string().max(160).optional(),
  description: z.string().max(320).optional(),
  ogImage: z.string().url().optional(),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProductSchema = z
  .object({
    title: z.string().min(3).max(160),
    slug: z.string().regex(slugRegex, "Invalid slug format"),
    description: z.string().min(1),
    shortDescription: z.string().optional(),
    categoryId: z.string().min(1),
    collectionIds: z.array(z.string()).default([]),
    gender: z.enum(["men", "women", "unisex"]),
    images: z.array(productImageSchema).default([]),
    basePrice: z.number().int().min(0),
    compareAtPrice: z.number().int().positive().optional(),
    hasVariants: z.boolean().default(false),
    variants: z.array(variantSchema).default([]),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional(),
    // Fashion / handloom attributes
    fabric: z.string().min(1),
    weave: z.string().optional(),
    color: z.string().optional(),
    pattern: z.string().optional(),
    occasion: z.string().optional(),
    fit: z.string().optional(),
    careInstructions: z.string().optional(),
    sizeChart: z.string().optional(),
    madeIn: z.string().default("India"),
    // Merchandising
    tags: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    seo: productSeoSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice !== undefined) {
        return data.compareAtPrice > data.basePrice;
      }
      return true;
    },
    { message: "compareAtPrice must be greater than basePrice", path: ["compareAtPrice"] },
  )
  .refine(
    (data) => {
      if (data.hasVariants) return data.variants.length >= 1;
      return true;
    },
    { message: "Variants required when hasVariants is true", path: ["variants"] },
  );

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
