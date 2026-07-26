import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, searchProducts, type ProductFilter } from "@/services/product.service";
import { getAllCategories } from "@/services/category.service";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/layout/empty-state";
import { ShopFilters } from "./filters";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse our full collection of handloom fashion for men and women.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sort = (params.sort as string) || "newest";
  const categorySlug = params.category as string | undefined;
  const gender = params.gender as "men" | "women" | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const inStock = params.inStock === "true";
  const searchQuery = (params.q as string) || "";

  const filter: ProductFilter = {};
  if (gender) filter.gender = gender;
  if (minPrice) filter.minPrice = minPrice;
  if (maxPrice) filter.maxPrice = maxPrice;
  if (inStock) filter.inStock = true;
  if (params.featured === "true") filter.isFeatured = true;
  if (params.bestseller === "true") filter.isBestSeller = true;

  // Resolve categoryId from slug
  if (categorySlug) {
    const allCats = await getAllCategories();
    const cat = allCats.find((c) => c.slug === categorySlug);
    if (cat) filter.categoryId = String(cat._id);
  }

  const result = searchQuery.trim().length >= 2
    ? { items: await searchProducts(searchQuery, 24), total: 0, page: 1, totalPages: 1 }
    : await getProducts(filter, { page, limit: 24, sort });
  const categories = await getAllCategories();

  // Serialize for client component
  const serializedCategories = categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ? String(c.parentId) : undefined,
  }));

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-16 md:py-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      {/* Page Header */}
      <div className="mb-12 mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
            {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? `${result.items.length} items found` : `${result.total} items`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground">
            <span>Sort By</span>
            <ChevronRight className="h-3.5 w-3.5 rotate-90" />
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters — desktop sidebar + mobile drawer */}
        <ShopFilters categories={serializedCategories} />

        {/* Product Grid */}
        <div>
          {result.items.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
                {result.items.map((product: Record<string, unknown>) => (
                  <ProductCard
                    key={String(product._id)}
                    slug={product.slug as string}
                    title={product.title as string}
                    price={product.basePrice as number}
                    compareAtPrice={product.compareAtPrice as number | undefined}
                    image={
                      (product.images as Array<{ url: string; alt: string }>)?.[0] || {
                        url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Product",
                        alt: product.title as string,
                      }
                    }
                    fabric={product.fabric as string}
                    isNewArrival={product.isNewArrival as boolean}
                    isBestSeller={product.isBestSeller as boolean}
                  />
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-4">
                  <Link
                    href={page > 1 ? `?page=${page - 1}` : "#"}
                    className="flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                  <div className="flex items-center gap-6 text-sm font-medium">
                    {Array.from({ length: Math.min(result.totalPages, 5) }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={`?page=${p}`}
                          className={
                            p === page
                              ? "border-b border-foreground px-1 font-semibold text-foreground"
                              : "px-1 text-muted-foreground transition-colors hover:text-foreground"
                          }
                        >
                          {p}
                        </Link>
                      ),
                    )}
                    {result.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Link
                          href={`?page=${result.totalPages}`}
                          className="px-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {result.totalPages}
                        </Link>
                      </>
                    )}
                  </div>
                  <Link
                    href={page < result.totalPages ? `?page=${page + 1}` : "#"}
                    className="flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
