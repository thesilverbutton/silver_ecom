import type { Metadata } from "next";
import { getProducts, type ProductFilter } from "@/services/product.service";
import { getAllCategories } from "@/services/category.service";
import { Container } from "@/components/layout/section";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/layout/empty-state";
import { ShopFilters } from "./filters";

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

  const result = await getProducts(filter, { page, limit: 24, sort });
  const categories = await getAllCategories();

  // Serialize for client component
  const serializedCategories = categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ? String(c.parentId) : undefined,
  }));

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shop All</h1>
        <p className="text-sm text-muted-foreground">{result.total} products</p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filters */}
        <aside className="hidden lg:block">
          <ShopFilters categories={serializedCategories} />
        </aside>

        {/* Product grid */}
        <div>
          {result.items.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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

              {result.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <PaginationLink currentPage={result.page} totalPages={result.totalPages} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

function PaginationLink({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  // Server component — render links for pagination (client Pagination component used in Phase 4)
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
