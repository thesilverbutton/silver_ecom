import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/services/product.service";
import { getCategoriesForGender } from "@/services/category.service";
import { Container, Section } from "@/components/layout/section";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Women",
  description: "Shop handloom fashion for women — sarees, kurtas, dupattas, dresses, and accessories.",
};

export default async function WomenPage() {
  const [result, categories] = await Promise.all([
    getProducts({ gender: "women" }, { limit: 12, sort: "newest" }),
    getCategoriesForGender("women"),
  ]);

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Women" }]} />

      <Section as="div" className="py-6">
        <h1 className="text-3xl font-bold">Women</h1>
        <p className="mt-2 text-muted-foreground">Handloom sarees, kurtas, dupattas, and more.</p>

        {/* Sub-categories */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={String(cat._id)}
              href={`/women/${cat.slug.replace("women-", "")}`}
              className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </Section>

      {/* Products */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
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
    </Container>
  );
}
