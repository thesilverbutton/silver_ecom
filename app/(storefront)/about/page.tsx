import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The Silver Button is a luxury textile and design brand embodying the historic craftsmanship of rural India within a narrative of cultural heritage.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[280px] w-full sm:h-[55vh] sm:min-h-[380px] md:h-[70vh]">
        <Image
          src="https://res.cloudinary.com/deht0dsks/image/upload/v1785558822/about_page_image_nhlo8n.png"
          alt="The Silver Button — Artisan craftsmanship"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(1.75rem,9vw,4rem)] font-bold leading-tight tracking-wide text-white">
            About Us
          </h1>
          <p className="mx-auto mt-3 max-w-[30ch] text-[13px] leading-relaxed text-white/90 sm:text-sm md:mt-4 md:max-w-xl md:text-base">
            Luxury textiles rooted in India&apos;s craft heritage
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-[1280px] px-5 pt-8 md:px-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </div>

      {/* Story Section */}
      <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-16 md:py-24">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
              Our Story
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              The Silver Button is a luxury textile brand that embodies the historic craftsmanship
              of rural India. Each creation is a testament to preserving and elevating traditional
              artistry — fusing age-old techniques with modern elegance.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Born from a homegrown vision and a shared respect for the past, our design language
              breathes new life into vintage textile collections, heirlooms, and the stories they
              carry.
            </p>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
              What We Do
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We specialize in innovative textile curation, intricate calligraphic embroideries, and
              repurposing character-rich materials into contemporary, wearable art.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We collaborate closely with artisan clusters across India&apos;s craft regions —
              celebrating patchwork, quilting, hand-embroidery, block prints, and fine beadwork.
            </p>
          </div>
        </div>

        {/* Statement */}
        <div className="mt-12 border-y border-border py-8 text-center md:mt-24 md:py-14">
          <p className="mx-auto max-w-3xl font-[family-name:var(--font-serif)] text-base font-medium leading-relaxed text-foreground sm:text-lg md:text-xl">
            The Silver Button is more than a label — it is a symbol of cultural continuity,
            fastening the beauty of the past to the sophistication of the present.
          </p>
        </div>
      </section>

      {/* Collections */}
      <section className="bg-secondary/30 py-12 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <h2 className="text-center font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
            Our Collections
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 md:mt-12 lg:grid-cols-4">
            {/* Male Handloom */}
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Male — Handloom
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Linen Shirt</li>
                <li>Linen Pants</li>
                <li>Calligraphed Linen Shirt</li>
              </ul>
            </div>

            {/* Male Silver Button Shirts */}
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Male — Silver Button
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Calligraphed Linen Shirts</li>
                <li>Linen with Silver Buttons</li>
                <li className="text-xs italic">Art forms — Type 1, 2, 3</li>
                <li>Custom Designed Shirts</li>
              </ul>
            </div>

            {/* Female Handloom */}
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Female — Handloom
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Linen Shirt</li>
                <li>Linen Pants</li>
                <li>Calligraphed Linen Shirt</li>
              </ul>
            </div>

            {/* Female Silver Button Shirts */}
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Female — Silver Button
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Calligraphed Linen Shirts</li>
                <li>Linen with Silver Buttons</li>
                <li className="text-xs italic">Art forms — Type 1, 2, 3</li>
                <li>Custom Designed Shirts</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center md:mt-12">
            <Link
              href="/shop"
              className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-lg border border-foreground px-8 text-sm font-medium uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
