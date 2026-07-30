"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { AuditLog } from "@/models/audit-log.model";
import { slugify } from "@/lib/utils";
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

const createSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  categoryId: z.string().min(1),
  gender: z.enum(["men", "women", "unisex"]),
  images: z.array(imageSchema).min(1, "At least one image is required"),
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

export type CreateProductInput = z.infer<typeof createSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "staff"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProductAction(input: CreateProductInput) {
  try {
    const session = await requireAdmin();

    const parsed = createSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Invalid data" };
    }
    const data = parsed.data;

    await connectDB();

    // Generate unique slug
    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await Product.create({
      ...data,
      slug,
      brand: "The Silver Button",
      currency: "INR",
      // If no variants, stock lives on the product; else it's per-variant
      stock: data.hasVariants ? 0 : data.stock,
      variants: data.hasVariants ? data.variants : [],
      hasVariants: data.hasVariants,
    });

    // Audit log
    await AuditLog.create({
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role as "admin" | "staff",
      action: "product.create",
      entity: "Product",
      entityId: String(product._id),
      after: { title: product.title, slug: product.slug },
    });

    logger.info("Product created", { productId: String(product._id), slug });
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { ok: true, productId: String(product._id) };
  } catch (err) {
    logger.error("createProductAction failed", { error: String(err) });
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create product" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) return { ok: false, error: "Product not found" };

    await Product.findByIdAndDelete(productId);

    await AuditLog.create({
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role as "admin" | "staff",
      action: "product.delete",
      entity: "Product",
      entityId: productId,
      after: { title: product.title, slug: product.slug },
    });

    logger.info("Product deleted", { productId, slug: product.slug });
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { ok: true };
  } catch (err) {
    logger.error("deleteProductAction failed", { error: String(err) });
    return { ok: false, error: "Failed to delete product" };
  }
}
