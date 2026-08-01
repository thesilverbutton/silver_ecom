"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { VariantSelector, type VariantOption } from "@/components/product/variant-selector";
import { SilverButtonCallout } from "@/components/product/silver-button-callout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { addToCart } from "@/actions/cart";
import { RatingStars } from "@/components/ui/rating-stars";
import { Separator } from "@/components/ui/separator";

interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  position: number;
}

interface Variant {
  _id: string;
  sku: string;
  options: Record<string, string>;
  priceDelta: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  gender: string;
  images: ProductImage[];
  basePrice: number;
  compareAtPrice?: number;
  hasVariants: boolean;
  variants: Variant[];
  stock: number;
  fabric: string;
  weave?: string;
  color?: string;
  pattern?: string;
  occasion?: string;
  fit?: string;
  careInstructions?: string;
  madeIn?: string;
  tags: string[];
  isBestSeller: boolean;
  isNewArrival: boolean;
  ratingAverage: number;
  ratingCount: number;
}

interface ProductDetailsProps {
  product: Product;
  isInCart?: boolean;
  /** Enables the sterling silver button callout over the primary gallery image. */
  isSilverButtonShirt?: boolean;
}

function ProductDetails({
  product,
  isInCart = false,
  isSilverButtonShirt = false,
}: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(isInCart);

  // Track selected options as a map (e.g., { size: "M", artForm: "Type 1" })
  const optionKeys = product.hasVariants
    ? Object.keys(product.variants[0]?.options || {})
    : [];

  const initialOptions: Record<string, string> = {};
  if (product.variants[0]) {
    for (const key of optionKeys) {
      initialOptions[key] = product.variants[0].options[key] || "";
    }
  }

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions);
  const [quantity, setQuantity] = useState(1);

  // Find the variant matching ALL selected options
  const activeVariant = product.variants.find(
    (v) => v.isActive && optionKeys.every((key) => v.options[key] === selectedOptions[key]),
  );

  const currentPrice = product.basePrice + (activeVariant?.priceDelta || 0);
  const isInStock = product.hasVariants
    ? (activeVariant?.stock ?? 0) > 0
    : product.stock > 0;

  // Group variant options with availability based on OTHER selected options
  const optionGroups = product.hasVariants
    ? optionKeys.map((key) => {
        const uniqueValues = [...new Set(product.variants.map((v) => v.options[key]))].filter(Boolean);
        return {
          label: key === "artForm" ? "Art Form" : key.charAt(0).toUpperCase() + key.slice(1),
          key,
          options: uniqueValues.map((val): VariantOption => {
            // Check if any variant with this option value (+ other currently selected options) is in stock
            const isAvailable = product.variants.some((v) => {
              if (v.options[key] !== val || !v.isActive) return false;
              // Check other selected options match
              return optionKeys.every((otherKey) => {
                if (otherKey === key) return true;
                return v.options[otherKey] === selectedOptions[otherKey] || !selectedOptions[otherKey];
              });
            });
            return {
              value: val!,
              label: val!,
              available: isAvailable,
            };
          }),
        };
      })
    : [];

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Left: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="relative w-full overflow-hidden rounded-lg bg-muted" style={{ paddingBottom: "133.33%" }}>
          {product.images[selectedImage] && (
            <Image
              src={product.images[selectedImage].url}
              alt={product.images[selectedImage].alt}
              fill
              className="absolute inset-0 object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
          {!product.images[selectedImage] && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted p-6">
              <span className="text-center text-lg font-medium text-muted-foreground">{product.title}</span>
            </div>
          )}

          {/*
            Only on the primary shot — the marker is positioned for the front view, so
            it would land on nothing once the shopper switches to a back or detail image.
          */}
          {isSilverButtonShirt && selectedImage === 0 && product.images[0] && (
            <SilverButtonCallout />
          )}
        </div>

        {/* Thumbnail Strip */}
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-32 w-24 flex-shrink-0 overflow-hidden rounded border-2 transition-colors focus:outline-none",
                  selectedImage === i ? "border-foreground" : "border-border hover:border-foreground/50",
                )}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col justify-start">
        {/* Badges */}
        <div className="mb-3 flex gap-2">
          {product.isNewArrival && (
            <span className="rounded bg-secondary px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
              New Arrival
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded bg-secondary px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
              Bestseller
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-foreground md:text-3xl">
          {product.title}
        </h1>

        {/* Rating */}
        {product.ratingCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <RatingStars rating={product.ratingAverage} size="sm" />
            <span className="text-sm text-muted-foreground">
              ({product.ratingAverage.toFixed(1)}/5)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-6">
          <PriceTag price={currentPrice} compareAtPrice={product.compareAtPrice} size="lg" />
        </div>

        <Separator className="my-6" />

        {/* Variant Selector */}
        {product.hasVariants && optionGroups.map((group) => (
          <div key={group.key} className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {group.label}
                {group.key === "artForm" && selectedOptions.artForm === "Customized" && (
                  <span className="ml-2 text-xs text-muted-foreground">(+₹{((activeVariant?.priceDelta || 0) / 100).toLocaleString("en-IN")} for customization)</span>
                )}
              </span>
            </div>
            <VariantSelector
              label={group.label}
              options={group.options}
              selected={selectedOptions[group.key]}
              onChange={(val) => {
                setSelectedOptions((prev) => ({ ...prev, [group.key]: val }));
              }}
            />
            {group.key === "artForm" && selectedOptions.artForm === "Customized" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Share your design vision and our artisans will bring it to life. We&apos;ll reach out after purchase to discuss your custom design.
              </p>
            )}
          </div>
        ))}

        {/* Quantity */}
        <div className="mb-8">
          <span className="mb-3 block text-sm font-medium text-foreground">Quantity</span>
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex h-10 w-10 items-center justify-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {added ? (
            <Link
              href="/cart"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-4 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingBag className="h-5 w-5" />
              Go to Cart
            </Link>
          ) : (
            <Button
              size="xl"
              className="flex-1 rounded-lg py-4 text-sm font-medium uppercase tracking-wider"
              disabled={!isInStock || isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await addToCart(product._id, 1, activeVariant?._id);
                  if (result.success) {
                    setAdded(true);
                  }
                });
              }}
            >
              {isPending ? (
                <>Adding...</>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  {isInStock ? "Add to Cart" : "Sold Out"}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Shipping Promises */}
        <div className="mt-8 space-y-3 rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Truck className="h-5 w-5 flex-shrink-0" />
            <span>Free delivery on orders above ₹1,999</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <RotateCcw className="h-5 w-5 flex-shrink-0" />
            <span>15-day easy returns</span>
          </div>
        </div>

        {/* Accordions */}
        <div className="mt-8">
          <Accordion type="multiple" defaultValue={["details"]}>
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium">Product Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {product.fabric && (
                    <p><span className="font-medium text-foreground">Fabric:</span> {product.fabric}</p>
                  )}
                  {product.weave && (
                    <p><span className="font-medium text-foreground">Weave:</span> {product.weave}</p>
                  )}
                  {product.color && (
                    <p><span className="font-medium text-foreground">Color:</span> {product.color}</p>
                  )}
                  {product.pattern && (
                    <p><span className="font-medium text-foreground">Pattern:</span> {product.pattern}</p>
                  )}
                  {product.occasion && (
                    <p><span className="font-medium text-foreground">Occasion:</span> {product.occasion}</p>
                  )}
                  {product.fit && (
                    <p><span className="font-medium text-foreground">Fit:</span> {product.fit}</p>
                  )}
                  {product.madeIn && (
                    <p><span className="font-medium text-foreground">Made in:</span> {product.madeIn}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {product.description && (
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm font-medium">Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {product.careInstructions && (
              <AccordionItem value="care">
                <AccordionTrigger className="text-sm font-medium">Care Instructions</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {product.careInstructions}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export { ProductDetails };
