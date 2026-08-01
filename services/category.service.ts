import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";

export async function getAllCategories() {
  await connectDB();
  return Category.find({ isActive: true }).sort({ position: 1 }).lean();
}

/** Guards against a cast error when the id comes from an untrusted/stale reference. */
export async function getCategoryById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  return Category.findById(id).lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return Category.findOne({ slug, isActive: true }).lean();
}

export async function getCategoriesByParent(parentId: string) {
  await connectDB();
  return Category.find({ parentId, isActive: true }).sort({ position: 1 }).lean();
}

export async function getRootCategories() {
  await connectDB();
  return Category.find({ parentId: { $exists: false }, isActive: true })
    .sort({ position: 1 })
    .lean();
}

/**
 * Get categories for a specific gender (Men or Women).
 * Returns the children of the gender parent category.
 */
export async function getCategoriesForGender(genderSlug: "men" | "women") {
  await connectDB();
  const parent = await Category.findOne({ slug: genderSlug, isActive: true }).lean();
  if (!parent) return [];
  return Category.find({ parentId: parent._id, isActive: true }).sort({ position: 1 }).lean();
}

// --- CRUD (used by admin in Phase 7) ---

export async function createCategory(data: Record<string, unknown>) {
  await connectDB();
  return Category.create(data);
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  await connectDB();
  return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}
