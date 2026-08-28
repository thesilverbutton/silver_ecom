import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import type { PaginatedResult, PaginationParams } from "@/types";

export interface ProductFilter {
  categoryId?: string;
  gender?: "men" | "women" | "unisex";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  fabric?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  status?: "draft" | "active" | "archived";
}

type SortOption = "newest" | "price_asc" | "price_desc" | "popular" | "name_asc";

const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { basePrice: 1 },
  price_desc: { basePrice: -1 },
  popular: { ratingCount: -1, ratingAverage: -1 },
  name_asc: { title: 1 },
};

function buildQuery(filter: ProductFilter) {
  const query: Record<string, unknown> = { status: filter.status || "active" };

  if (filter.categoryId) query.categoryId = filter.categoryId;
  if (filter.gender) query.gender = filter.gender;
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.basePrice = {};
    if (filter.minPrice !== undefined) (query.basePrice as Record<string, number>).$gte = filter.minPrice;
    if (filter.maxPrice !== undefined) (query.basePrice as Record<string, number>).$lte = filter.maxPrice;
  }
  if (filter.inStock) {
    query.$or = [
      { hasVariants: false, stock: { $gt: 0 } },
      { hasVariants: true, "variants.stock": { $gt: 0 } },
    ];
  }
  if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };
  if (filter.fabric) query.fabric = filter.fabric;
  if (filter.isFeatured) query.isFeatured = true;
  if (filter.isBestSeller) query.isBestSeller = true;
  if (filter.isNewArrival) query.isNewArrival = true;

  return query;
}

export async function getProducts(
  filter: ProductFilter = {},
  pagination: PaginationParams = {},
): Promise<PaginatedResult<Record<string, unknown>>> {
  await connectDB();

  const { page = 1, limit = 24, sort = "newest" } = pagination;
  const skip = (page - 1) * Math.min(limit, 60);
  const safeLimit = Math.min(limit, 60);
  const sortOrder = SORT_MAP[sort as SortOption] || SORT_MAP.newest;
  const query = buildQuery(filter);

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(safeLimit)
      .select("title slug images basePrice compareAtPrice gender fabric isNewArrival isBestSeller stock hasVariants variants categoryId")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    items,
    page,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, status: "active" }).lean();
  return product;
}

// --- Admin product listing (shows ALL statuses, supports filters) ---

export interface AdminProductFilter {
  categoryId?: string;
  gender?: "men" | "women" | "unisex";
  status?: "draft" | "active" | "archived";
  q?: string;
}

export async function getAdminProducts(
  filter: AdminProductFilter = {},
  pagination: PaginationParams = {},
): Promise<PaginatedResult<Record<string, unknown>>> {
  await connectDB();

  const { page = 1, limit = 20 } = pagination;
  const safeLimit = Math.min(limit, 60);
  const skip = (page - 1) * safeLimit;

  const query: Record<string, unknown> = {};
  if (filter.categoryId) query.categoryId = filter.categoryId;
  if (filter.gender) query.gender = filter.gender;
  if (filter.status) query.status = filter.status;
  if (filter.q) query.title = { $regex: filter.q.trim(), $options: "i" };

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select("title slug images basePrice gender status hasVariants stock variants categoryId")
      .lean(),
    Product.countDocuments(query),
  ]);

  return { items, page, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) };
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  await connectDB();
  return Product.find({
    _id: { $ne: productId },
    categoryId,
    status: "active",
  })
    .limit(limit)
    .select("title slug images basePrice compareAtPrice gender fabric")
    .lean();
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();
  return Product.find({ status: "active", isFeatured: true })
    .limit(limit)
    .select("title slug images basePrice compareAtPrice gender fabric isBestSeller isNewArrival")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getBestSellers(limit = 8) {
  await connectDB();
  return Product.find({ status: "active", isBestSeller: true })
    .limit(limit)
    .select("title slug images basePrice compareAtPrice gender fabric")
    .sort({ ratingCount: -1 })
    .lean();
}

export async function getNewArrivals(limit = 12) {
  await connectDB();
  return Product.find({ status: "active", isNewArrival: true })
    .limit(limit)
    .select("title slug images basePrice compareAtPrice gender fabric isNewArrival")
    .sort({ createdAt: -1 })
    .lean();
}

export async function searchProducts(query: string, limit = 8) {
  await connectDB();
  if (!query || query.trim().length < 2) return [];

  return Product.find(
    { $text: { $search: query }, status: "active" },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .select("title slug images basePrice gender fabric")
    .lean();
}

// --- CRUD (used by admin in Phase 7) ---

export async function createProduct(data: Record<string, unknown>) {
  await connectDB();
  return Product.create(data);
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  await connectDB();
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function archiveProduct(id: string) {
  await connectDB();
  return Product.findByIdAndUpdate(id, { status: "archived" }, { new: true });
}
