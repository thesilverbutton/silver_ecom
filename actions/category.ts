"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";
import { Product } from "@/models/product.model";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "staff"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

const createSchema = z.object({
  name: z.string().min(1).max(60),
  gender: z.enum(["men", "women"]),
});

export async function createCategoryAction(input: { name: string; gender: "men" | "women" }) {
  try {
    await requireAdmin();
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid data" };

    await connectDB();

    // Find the gender parent category
    const parent = await Category.findOne({ slug: parsed.data.gender });
    if (!parent) return { ok: false, error: "Gender parent category not found" };

    // Generate gender-prefixed slug
    const baseSlug = `${parsed.data.gender}-${slugify(parsed.data.name)}`;
    const exists = await Category.findOne({ slug: baseSlug });
    if (exists) return { ok: false, error: "This category already exists for this gender" };

    // Position = count of siblings
    const siblingCount = await Category.countDocuments({ parentId: parent._id });

    await Category.create({
      name: parsed.data.name,
      slug: baseSlug,
      parentId: parent._id,
      kind: "category",
      position: siblingCount,
      isActive: true,
    });

    logger.info("Category created", { slug: baseSlug });
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    logger.error("createCategoryAction failed", { error: String(err) });
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    await requireAdmin();
    await connectDB();

    // Guard: cannot delete if products use it
    const productCount = await Product.countDocuments({ categoryId });
    if (productCount > 0) {
      return { ok: false, error: `Cannot delete — ${productCount} product(s) use this category. Move or delete them first.` };
    }

    // Guard: cannot delete gender root categories
    const cat = await Category.findById(categoryId);
    if (!cat) return { ok: false, error: "Category not found" };
    if (!cat.parentId) return { ok: false, error: "Cannot delete a gender root category" };

    await Category.findByIdAndDelete(categoryId);

    logger.info("Category deleted", { categoryId });
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    logger.error("deleteCategoryAction failed", { error: String(err) });
    return { ok: false, error: "Failed to delete" };
  }
}
