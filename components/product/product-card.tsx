"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: { url: string; alt: string };
  secondImage?: { url: string; alt: string };
  isOutOfStock?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  fabric?: string;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
  className?: string;
}

function ProductCard({
  slug,
  title,
  price,
  compareAtPrice,
  image,
  secondImage,
  isOutOfStock = false,
  isBestSeller = false,
  isNewArrival = false,
  fabric,
  onWishlistToggle,
  isWishlisted = false,
  className,
}: ProductCardProps) {
  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Image */}
      <Link href={`/products/${slug}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-300",
            secondImage && "group-hover:opacity-0",
            isOutOfStock && "opacity-60",
          )}
        />
        {secondImage && (
          <Image
            src={secondImage.url}
            alt={secondImage.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* Badges overlay */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isNewArrival && <Badge variant="accent" className="text-[10px]">New</Badge>}
          {isBestSeller && <Badge variant="secondary" className="text-[10px]">Bestseller</Badge>}
          {isOutOfStock && <Badge variant="destructive" className="text-[10px]">Sold Out</Badge>}
        </div>
      </Link>

      {/* Wishlist button */}
      {onWishlistToggle && (
        <button
          type="button"
          onClick={onWishlistToggle}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-destructive text-destructive")} />
        </button>
      )}

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <Link href={`/products/${slug}`} className="text-sm font-medium leading-tight line-clamp-2 hover:underline">
          {title}
        </Link>
        {fabric && <p className="text-xs text-muted-foreground">{fabric}</p>}
        <PriceTag price={price} compareAtPrice={compareAtPrice} size="sm" />
      </div>
    </div>
  );
}

export { ProductCard, type ProductCardProps };
