import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The Silver Button is a luxury textile and design brand embodying the historic craftsmanship of rural India within a narrative of cultural heritage.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-16 md:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section className="mt-10 max-w-3xl">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-foreground md:text-4xl">
          About Us
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            The Silver Button is a luxury textile and design brand that embodies the historic
            craftsmanship of rural India within a narrative of cultural heritage. Each creation
            stands as a testament to our dedication to preserving and elevating traditional
            artistry, beautifully fusing age-old techniques with elegance.
          </p>

          <p>
            Our journey began as a homegrown vision rooted in the warmth of family partnership and
            a shared respect for the past. Inspired by the richness of vintage textile collections,
            heirlooms, and the stories they carry, our design language breathes new life into the
            old.
          </p>

          <p>
            We specialize in innovative textile curation, intricate calligraphic embroideries, and
            repurposing character-rich materials into contemporary, wearable art. From hand-woven
            fabrics and vintage tapestries to classic silhouettes, every piece we create tells a
            distinct story.
          </p>

          <p>
            At the core of The Silver Button is a deep commitment to community. We collaborate
            closely with artisan clusters across India&apos;s vibrant craft regions, working
            hand-in-hand to celebrate diverse, storytelling techniques — ranging from detailed
            patchwork and quilting to traditional hand-embroidery, block prints, and fine beadwork.
          </p>

          <p className="font-medium text-foreground">
            The Silver Button is more than a label; it is a symbol of cultural continuity,
            seamlessly fastening the beauty of the past to the sophistication of the present.
          </p>
        </div>
      </section>

      {/* Collections overview */}
      <section className="mt-20">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
          Our Collections
        </h2>

        <div className="mt-10 grid gap-12 md:grid-cols-2">
          {/* Male */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">Male (Handloom)</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Linen Shirt</li>
              <li>Linen Pants</li>
              <li>Calligraphed Linen Shirt</li>
            </ul>

            <h4 className="mt-8 text-base font-semibold text-foreground">
              The Silver Button Shirts
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Calligraphed Linen Shirts</li>
              <li>Linen shirts with silver buttons</li>
              <li className="pl-4 text-xs italic text-muted-foreground">
                Choose from Art forms — Type 1, Type 2, Type 3
              </li>
              <li>Customized Designed Linen shirts with silver buttons</li>
            </ul>
          </div>

          {/* Female */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">Female (Handloom)</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Linen Shirt</li>
              <li>Linen Pants</li>
              <li>Calligraphed Linen Shirt</li>
            </ul>

            <h4 className="mt-8 text-base font-semibold text-foreground">
              The Silver Button Shirts
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Calligraphed Linen Shirts</li>
              <li>Linen shirts with silver buttons</li>
              <li className="pl-4 text-xs italic text-muted-foreground">
                Choose from Art forms — Type 1, Type 2, Type 3
              </li>
              <li>Customized Designed Linen shirts with silver buttons</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
