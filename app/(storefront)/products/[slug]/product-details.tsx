"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";
import { VariantSelector, type VariantOption } from "@/components/product/variant-selector";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
}

function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants[0]?._id,
  );

  const activeVariant = product.variants.find((v) => v._id === selectedVariant);
  const currentPrice = product.basePrice + (activeVariant?.priceDelta || 0);
  const isInStock = product.hasVariants
    ? (activeVariant?.stock ?? 0) > 0
    : product.stock > 0;

  // Group variant options (e.g., size, color)
  const optionGroups = product.hasVariants
    ? Object.keys(product.variants[0]?.options || {}).map((key) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        key,
        options: [...new Set(product.variants.map((v) => v.options[key]))].filter(Boolean).map(
          (val): VariantOption => {
            const matchingVariant = product.variants.find(
              (v) => v.options[key] === val && v.isActive,
            );
            return {
              value: val!,
              label: val!,
              available: (matchingVariant?.stock ?? 0) > 0,
            };
          },
        ),
      }))
    : [];

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
          {product.images[selectedImage] && (
            <Image
              src={product.images[selectedImage].url}
              alt={product.images[selectedImage].alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
          {!product.images[selectedImage] && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  selectedImage === i ? "border-primary" : "border-transparent",
                )}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col">
        {/* Badges */}
        <div className="flex gap-2">
          {product.isNewArrival && <Badge variant="accent">New Arrival</Badge>}
          {product.isBestSeller && <Badge variant="secondary">Bestseller</Badge>}
          {!isInStock && <Badge variant="destructive">Sold Out</Badge>}
        </div>

        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-2xl font-bold md:text-3xl">
          {product.title}
        </h1>

        {/* Rating */}
        {product.ratingCount > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={product.ratingAverage} size="sm" />
            <span className="text-sm text-muted-foreground">({product.ratingCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-4">
          <PriceTag price={currentPrice} compareAtPrice={product.compareAtPrice} size="lg" />
        </div>

        {/* Short description */}
        {product.shortDescription && (
          <p className="mt-4 text-sm text-muted-foreground">{product.shortDescription}</p>
        )}

        <Separator className="my-6" />

        {/* Variants */}
        {product.hasVariants && optionGroups.map((group) => (
          <VariantSelector
            key={group.key}
            label={group.label}
            options={group.options}
            selected={activeVariant?.options[group.key]}
            onChange={(val) => {
              const match = product.variants.find((v) => v.options[group.key] === val && v.isActive);
              if (match) setSelectedVariant(match._id);
            }}
            className="mb-4"
          />
        ))}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button size="xl" className="flex-1" disabled={!isInStock}>
            <ShoppingBag className="h-5 w-5" />
            {isInStock ? "Add to Cart" : "Sold Out"}
          </Button>
          <Button variant="outline" size="xl">
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick info */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Free shipping on orders above ₹999</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            <span>7-day easy returns</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Product details accordion */}
        <Accordion type="multiple" defaultValue={["details", "fabric"]}>
          <AccordionItem value="details">
            <AccordionTrigger>Product Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                {product.fabric && <p><span className="font-medium text-foreground">Fabric:</span> {product.fabric}</p>}
                {product.weave && <p><span className="font-medium text-foreground">Weave:</span> {product.weave}</p>}
                {product.color && <p><span className="font-medium text-foreground">Color:</span> {product.color}</p>}
                {product.pattern && <p><span className="font-medium text-foreground">Pattern:</span> {product.pattern}</p>}
                {product.occasion && <p><span className="font-medium text-foreground">Occasion:</span> {product.occasion}</p>}
                {product.fit && <p><span className="font-medium text-foreground">Fit:</span> {product.fit}</p>}
                {product.madeIn && <p><span className="font-medium text-foreground">Made in:</span> {product.madeIn}</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {product.description && (
            <AccordionItem value="fabric">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              </AccordionContent>
            </AccordionItem>
          )}

          {product.careInstructions && (
            <AccordionItem value="care">
              <AccordionTrigger>Care Instructions</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.careInstructions}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
}

export { ProductDetails };
