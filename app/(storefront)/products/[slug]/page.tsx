import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getProductBySlug, getRelatedProducts } from "@/services/product.service";
import { getCategoryById } from "@/services/category.service";
import { getCart as getCartService } from "@/services/cart.service";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { siteConfig } from "@/config/site";
import { ProductDetails } from "./product-details";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not Found" };

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Check if product is already in cart (read-only, no cookie creation)
  let isInCart = false;
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get("tsb_cart_id")?.value;
    if (cartId) {
      const cart = await getCartService(cartId);
      isInCart = cart.items.some((item) => item.productId === String(product._id));
    }
  } catch {
    // No cart cookie or read failed — isInCart stays false
  }

  const [related, category] = await Promise.all([
    getRelatedProducts(String(product._id), String(product.categoryId), 8),
    getCategoryById(String(product.categoryId)),
  ]);

  // The silver button callout is reserved for the Silver Button Shirts categories
  // ("men-silver-button-shirts" / "women-silver-button-shirts"). The tag is a
  // fallback so admin-created products land the treatment even if filed elsewhere.
  const isSilverButtonShirt =
    Boolean(category?.slug?.endsWith("silver-button-shirts")) ||
    (product.tags ?? []).includes("silver-button");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription || product.description.slice(0, 300),
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: "The Silver Button" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.basePrice / 100).toFixed(2),
      availability: product.stock > 0 || product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
      },
    }),
  };

  const genderLabel = product.gender === "men" ? "Men" : product.gender === "women" ? "Women" : "Unisex";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-16 md:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: genderLabel, href: `/${product.gender}` },
            { label: product.title },
          ]}
        />

        <ProductDetails
          product={JSON.parse(JSON.stringify(product))}
          isInCart={isInCart}
          isSilverButtonShirt={isSilverButtonShirt}
        />

        {/* You may also like */}
        {related.length > 0 && (
          <section className="mb-12 mt-24">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground md:text-2xl">
                You may also like
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {related.map((rp) => (
                <ProductCard
                  key={String(rp._id)}
                  slug={rp.slug}
                  title={rp.title}
                  price={rp.basePrice}
                  compareAtPrice={rp.compareAtPrice}
                  image={rp.images?.[0] || { url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Product", alt: rp.title }}
                  fabric={rp.fabric}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
