"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/price-tag";
import { useWishlist } from "@/hooks/use-wishlist";

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
  className,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [secondImgError, setSecondImgError] = useState(false);
  const { toggle, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(slug);

  return (
    <div className={cn("group flex cursor-pointer flex-col", className)}>
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="relative mb-4 aspect-[2/3] w-full overflow-hidden rounded-sm bg-foreground"
      >
        {/* Fallback: black bg with product title */}
        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground p-4">
            <span className="text-center text-sm font-medium text-background/70">{title}</span>
          </div>
        )}

        {!imgError && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            className={cn(
              "object-cover transition-transform duration-700 ease-in-out group-hover:scale-105",
              secondImage && !secondImgError && "group-hover:opacity-0",
              isOutOfStock && "opacity-60",
            )}
          />
        )}

        {secondImage && !secondImgError && !imgError && (
          <Image
            src={secondImage.url}
            alt={secondImage.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setSecondImgError(true)}
            className="object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        {/* Badges - top left */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isNewArrival && (
            <span className="rounded bg-secondary/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
              New
            </span>
          )}
          {isBestSeller && (
            <span className="rounded bg-secondary/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
              Bestseller
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded bg-destructive/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist - top right (always visible) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(slug);
          }}
          className={cn(
            "absolute right-3 top-3 rounded-full p-1.5 backdrop-blur-sm transition-all",
            wishlisted
              ? "bg-white/90 text-destructive"
              : "bg-background/50 text-foreground opacity-0 group-hover:opacity-100 sm:opacity-0",
            // Always show on touch (no hover), show filled state always
            wishlisted && "!opacity-100",
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("h-4 w-4 transition-transform", wishlisted && "scale-110 fill-destructive text-destructive")}
          />
        </button>
      </Link>

      {/* Product info */}
      <div className="flex flex-col gap-1 px-1">
        <Link
          href={`/products/${slug}`}
          className="text-sm font-medium leading-tight text-foreground line-clamp-2 hover:underline"
        >
          {title}
        </Link>
        <div className="mt-1">
          <PriceTag price={price} compareAtPrice={compareAtPrice} size="sm" />
        </div>
      </div>
    </div>
  );
}

export { ProductCard, type ProductCardProps };
