import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/services/product.service";
import { getCategoryBySlug } from "@/services/category.service";
import { Container } from "@/components/layout/section";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/layout/empty-state";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(`men-${category}`);
  if (!cat) return { title: "Not Found" };
  return {
    title: `Men's ${cat.name}`,
    description: `Shop handloom ${cat.name.toLowerCase()} for men.`,
  };
}

export default async function MenCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = await getCategoryBySlug(`men-${category}`);
  if (!cat) notFound();

  const result = await getProducts({ categoryId: String(cat._id), gender: "men" }, { limit: 24, sort: "newest" });

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Men", href: "/men" }, { label: cat.name }]} />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">Men&apos;s {cat.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{result.total} products</p>
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No products yet" description="Check back soon for new arrivals." className="mt-8" />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            />
          ))}
        </div>
      )}
    </Container>
  );
}
