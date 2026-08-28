import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getBestSellers } from "@/services/product.service";
import { getCategoriesForGender } from "@/services/category.service";
import { ProductCard } from "@/components/product/product-card";
import { DraggableHeroImage } from "@/components/home/draggable-hero-image";
import { ArrowRight } from "lucide-react";

const PLACEHOLDER = "https://placehold.co/400x533/e5e7eb/4b5563?text=Product";

/** Mirrors the captions baked into hero_image.png, for legibility on small screens. */
const CRAFT_STEPS = [
  "Farming",
  "Fibre Preparation",
  "Hand Weaving",
  "Handcrafted",
  "Silver Craftsmanship",
  "Timeless Creation",
] as const;

const CATEGORY_GROUPS = [
  { label: "Men", prefix: "men-", base: "/men" },
  { label: "Women", prefix: "women-", base: "/women" },
] as const;

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
      {/*
        Hero — the artwork is an ultra-wide (1774x887) six-step craft infographic.
        Headline and CTA sit in normal flow rather than absolutely over the image, so
        they can never overflow the viewport or cover the artwork on narrow screens.
      */}
      <section className="bg-[#F6F3ED]">
        <div className="mx-auto max-w-[1280px] px-5 pt-10 pb-6 text-center md:px-16 md:pt-14 md:pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#635341] sm:text-[11px] sm:tracking-[0.28em]">
            Handloom · Heritage · Craft
          </p>
          <h1 className="mx-auto mt-3 max-w-[15ch] font-[family-name:var(--font-serif)] text-[clamp(1.6rem,8vw,3.5rem)] font-bold uppercase leading-[1.15] tracking-[0.08em] text-[#3C332A] md:max-w-none md:tracking-[0.18em]">
            The Silver Button
          </h1>
          <p className="mx-auto mt-4 max-w-[34ch] text-[13px] leading-relaxed text-[#4F4232] sm:text-sm md:max-w-xl md:text-base">
            Every piece passes through six pairs of hands before it
            reaches yours.
          </p>
        </div>

        <DraggableHeroImage />

        <ol className="mx-auto grid max-w-md grid-cols-2 gap-x-4 gap-y-3 px-5 pt-6 sm:max-w-2xl sm:grid-cols-3 md:hidden">
          {CRAFT_STEPS.map((step, i) => (
            <li key={step} className="flex items-baseline gap-2">
              <span className="text-[10px] font-semibold tabular-nums text-[#736350]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-medium uppercase leading-tight tracking-[0.06em] text-[#4F4232]">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-center gap-3 px-5 pb-12 pt-6 md:pb-16 md:pt-8">
          <Link
            href="/shop"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary px-8 text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:w-auto md:min-h-14 md:px-10 md:text-sm"
          >
            Explore Collection
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* Category chips — grouped by gender */}
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-16 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {CATEGORY_GROUPS.map((group) => {
            const cats = allCategories.filter((cat) => cat.slug.startsWith(group.prefix));
            if (cats.length === 0) return null;

            return (
              <div key={group.label}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {group.label}
                  </h2>
                  <Link
                    href={group.base}
                    className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all
                  </Link>
                </div>

                {/*
                  Two-up grid on mobile so chips always fit the viewport — no clipping,
                  no truncation. A trailing odd chip spans the full row instead of
                  leaving a ragged gap. Reverts to natural-width wrapping from md up.
                */}
                <div className="mt-3 grid grid-cols-2 gap-2.5 [&>*:last-child:nth-child(odd)]:col-span-2 md:flex md:flex-wrap">
                  {cats.map((cat) => (
                    <Link
                      key={String(cat._id)}
                      href={`${group.base}/${cat.slug.replace(group.prefix, "")}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-secondary/40 px-4 text-center text-[13px] font-medium leading-tight text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-secondary hover:text-foreground md:px-5 md:text-sm"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-16 md:py-24">
          <div className="mb-6 flex items-end justify-between gap-4 md:mb-10">
            <h2 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
              Featured
            </h2>
            <Link
              href="/shop?featured=true"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-6">
            {featured.map((product) => (
              <ProductCard
                key={String(product._id)}
                slug={product.slug}
                title={product.title}
                price={product.basePrice}
                compareAtPrice={product.compareAtPrice}
                image={product.images[0] || { url: PLACEHOLDER, alt: product.title }}
                secondImage={product.images[1]}
                fabric={product.fabric}
                isNewArrival={product.isNewArrival}
                isBestSeller={product.isBestSeller}
              />
            ))}
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="bg-secondary/30 py-14 md:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 md:grid-cols-2 md:gap-12 md:px-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[3/2] md:aspect-square">
            <Image
              src="/hero_images/about_m1_u-min.webp"
              alt="Artisan weaving on a handloom"
              fill
              quality={70}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 500px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start justify-center">
            <h2 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
              Woven with Purpose
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:mt-6 md:text-base">
              Every piece at The Silver Button is handcrafted by artisans preserving centuries-old
              weaving traditions. Slow fashion, made to last.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-foreground px-8 text-sm font-medium uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto md:mt-8"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-16 md:py-24">
          <div className="mb-6 flex items-end justify-between gap-4 md:mb-10">
            <h2 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
              Best Sellers
            </h2>
            <Link
              href="/shop?bestseller=true"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard
                key={String(product._id)}
                slug={product.slug}
                title={product.title}
                price={product.basePrice}
                compareAtPrice={product.compareAtPrice}
                image={product.images[0] || { url: PLACEHOLDER, alt: product.title }}
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
