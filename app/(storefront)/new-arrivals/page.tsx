import type { Metadata } from "next";
import { getNewArrivals } from "@/services/product.service";
import { Container } from "@/components/layout/section";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/layout/empty-state";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "Discover the latest handloom fashion additions at The Silver Button.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]} />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">New Arrivals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fresh from the loom</p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="Coming soon" description="New arrivals are on their way." className="mt-8" />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={String(product._id)}
              slug={product.slug}
              title={product.title}
              price={product.basePrice}
              compareAtPrice={product.compareAtPrice}
              image={product.images?.[0] || { url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Product", alt: product.title }}
              fabric={product.fabric}
              isNewArrival
            />
          ))}
        </div>
      )}
    </Container>
  );
}
