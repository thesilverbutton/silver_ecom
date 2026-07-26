import Link from "next/link";
import { getFeaturedProducts, getBestSellers } from "@/services/product.service";
import { getCategoriesForGender } from "@/services/category.service";
import { HeroCarousel } from "@/components/layout/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [featured, bestSellers, menCategories, womenCategories] = await Promise.all([
    getFeaturedProducts(8),
    getBestSellers(8),
    getCategoriesForGender("men"),
    getCategoriesForGender("women"),
  ]);

  const allCategories = [...menCategories, ...womenCategories];

  return (
    <>
      {/* Hero */}
      <HeroCarousel>
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl max-w-3xl">
            Handloom Fashion
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Crafted with tradition for the modern wardrobe.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/men"
              className="rounded-lg bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Shop Men
            </Link>
            <Link
              href="/women"
              className="rounded-lg border border-white bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-white/10"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </HeroCarousel>

      {/* Category Pills */}
      <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-16">
        <div className="flex flex-wrap gap-3">
          {allCategories.map((cat) => (
            <Link
              key={String(cat._id)}
              href={`/${cat.slug.startsWith("men") ? "men" : "women"}/${cat.slug.replace(/^(men|women)-/, "")}`}
              className="rounded-full border border-border bg-secondary/30 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-secondary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-16 md:py-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
              Featured
            </h2>
            <Link
              href="/shop?featured=true"
              className="inline-flex items-center gap-1 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
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
        </section>
      )}

      {/* Brand Story / Bento Section */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-5 md:grid-cols-2 md:px-16">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl md:aspect-square">
            <img
              src="/hero_images/about_m1_u-min.webp"
              alt="Artisan weaving on a handloom"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Content */}
          <div className="flex flex-col items-start justify-center">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
              Woven with Purpose
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Every piece at The Silver Button is handcrafted by artisans preserving centuries-old
              weaving traditions. Slow fashion, made to last. We believe in the tactile beauty of
              handloom and the stories woven into every thread.
            </p>
            <Link
              href="/about"
              className="mt-8 rounded-lg border border-foreground px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-16 md:py-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
              Best Sellers
            </h2>
            <Link
              href="/shop?bestseller=true"
              className="inline-flex items-center gap-1 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
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
        </section>
      )}
    </>
  );
}
