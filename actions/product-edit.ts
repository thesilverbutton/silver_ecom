"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { AuditLog } from "@/models/audit-log.model";
import { logger } from "@/lib/logger";

const IMAGE_LABELS = ["Front", "Back", "Zoomed", "Customized", "Type 1", "Type 2", "Type 3"] as const;

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  label: z.enum(IMAGE_LABELS),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  position: z.number().int().min(0),
});

const variantSchema = z.object({
  sku: z.string().min(1),
  options: z.record(z.string(), z.string()),
  priceDelta: z.number().int().default(0),
  stock: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

const updateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  categoryId: z.string().min(1),
  gender: z.enum(["men", "women", "unisex"]),
  images: z.array(imageSchema).min(1),
  basePrice: z.number().int().min(0),
  compareAtPrice: z.number().int().positive().optional(),
  hasVariants: z.boolean(),
  variants: z.array(variantSchema),
  stock: z.number().int().min(0).default(0),
  fabric: z.string().min(1),
  weave: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  occasion: z.string().optional(),
  fit: z.string().optional(),
  careInstructions: z.string().optional(),
  madeIn: z.string().default("India"),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  status: z.enum(["draft", "active", "archived"]).default("active"),
});

export type UpdateProductInput = z.infer<typeof updateSchema>;

export async function updateProductAction(productId: string, input: UpdateProductInput) {
  try {
    const session = await auth();
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return { ok: false, error: "Unauthorized" };
    }

    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Invalid data" };
    }

    await connectDB();

    const existing = await Product.findById(productId);
    if (!existing) return { ok: false, error: "Product not found" };

    const data = parsed.data;

    await Product.findByIdAndUpdate(productId, {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      categoryId: data.categoryId,
      gender: data.gender,
      images: data.images,
      basePrice: data.basePrice,
      compareAtPrice: data.compareAtPrice,
      hasVariants: data.hasVariants,
      variants: data.hasVariants ? data.variants : [],
      stock: data.hasVariants ? 0 : data.stock,
      fabric: data.fabric,
      weave: data.weave,
      color: data.color,
      pattern: data.pattern,
      occasion: data.occasion,
      fit: data.fit,
      careInstructions: data.careInstructions,
      madeIn: data.madeIn,
      tags: data.tags,
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
      isNewArrival: data.isNewArrival,
      status: data.status,
    });

    await AuditLog.create({
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role as "admin" | "staff",
      action: "product.update",
      entity: "Product",
      entityId: productId,
      after: { title: data.title },
    });

    logger.info("Product updated", { productId });
    revalidatePath("/admin/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath("/shop");

    return { ok: true };
  } catch (err) {
    logger.error("updateProductAction failed", { error: String(err) });
    return { ok: false, error: "Failed to update product" };
  }
}
