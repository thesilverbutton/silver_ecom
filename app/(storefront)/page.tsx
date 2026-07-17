import Link from "next/link";
import { getFeaturedProducts, getBestSellers } from "@/services/product.service";
import { getCategoriesForGender } from "@/services/category.service";
import { Container, Section } from "@/components/layout/section";
import { HeroCarousel } from "@/components/layout/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [featured, bestSellers, menCategories, womenCategories] = await Promise.all([
    getFeaturedProducts(8),
    getBestSellers(8),
    getCategoriesForGender("men"),
    getCategoriesForGender("women"),
  ]);

  return (
    <>
      {/* Hero */}
      <HeroCarousel>
        <Container className="text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            Handloom Fashion
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
            Crafted with tradition for the modern wardrobe. Explore our curated collection for men and women.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/men" className={buttonVariants({ size: "lg", className: "!bg-white !text-black hover:!bg-white/90" })}>Shop Men</Link>
            <Link href="/women" className={buttonVariants({ size: "lg", className: "!bg-white !text-black hover:!bg-white/90" })}>Shop Women</Link>
          </div>
        </Container>
      </HeroCarousel>

      {/* Category highlights */}
      <Section>
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            {/* Men */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Men</h2>
                <Link href="/men" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {menCategories.map((cat) => (
                  <Link
                    key={String(cat._id)}
                    href={`/men/${cat.slug.replace("men-", "")}`}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Women */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Women</h2>
                <Link href="/women" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {womenCategories.map((cat) => (
                  <Link
                    key={String(cat._id)}
                    href={`/women/${cat.slug.replace("women-", "")}`}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured products */}
      {featured.length > 0 && (
        <Section className="bg-secondary/30">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured</h2>
              <Link href="/shop?featured=true" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={String(product._id)}
                  slug={product.slug}
                  title={product.title}
                  price={product.basePrice}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images[0] || { url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Product", alt: product.title }}
                  secondImage={product.images[1]}
                  fabric={product.fabric}
                  isNewArrival={product.isNewArrival}
                  isBestSeller={product.isBestSeller}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <Section>
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Best Sellers</h2>
              <Link href="/shop?bestseller=true" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard
                  key={String(product._id)}
                  slug={product.slug}
                  title={product.title}
                  price={product.basePrice}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images[0] || { url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Product", alt: product.title }}
                  secondImage={product.images[1]}
                  fabric={product.fabric}
                  isBestSeller
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Brand story teaser */}
      <Section className="bg-secondary/30">
        <Container size="narrow" className="text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold md:text-3xl">
            Woven with Purpose
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every piece at The Silver Button is handcrafted by artisans preserving centuries-old weaving traditions. Slow fashion, made to last.
          </p>
          <Link href="/about" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
            Our Story
          </Link>
        </Container>
      </Section>
    </>
  );
}
