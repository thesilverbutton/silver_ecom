import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about The Silver Button — handloom fashion preserving India's weaving heritage.",
};

export default function AboutPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <Section as="div" className="py-8">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold md:text-4xl">
          Our Story
        </h1>

        <div className="mt-8 max-w-2xl space-y-6 text-muted-foreground">
          <p>
            The Silver Button was born from a simple belief: everyday clothing can be both beautiful
            and meaningful. We work directly with handloom artisans across India to bring you
            clothing that carries centuries of weaving tradition into your modern wardrobe.
          </p>
          <p>
            Every piece at The Silver Button is handcrafted by artisans preserving centuries-old weaving traditions. Slow fashion, made to last.
          </p>
          <p>
            We believe in slow fashion: fewer pieces, better quality, longer life. When you choose
            a handloom garment, you&apos;re supporting artisan livelihoods and preserving a craft that
            has sustained communities for generations.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-foreground">What We Stand For</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Direct relationships with weaver communities</li>
            <li>Natural and sustainable fabrics</li>
            <li>Fair pricing — honest margins, no inflated MRPs</li>
            <li>Slow fashion over fast trends</li>
            <li>Clothing made to last and age gracefully</li>
          </ul>
        </div>
      </Section>
    </Container>
  );
}
