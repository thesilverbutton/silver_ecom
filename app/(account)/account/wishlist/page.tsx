"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PriceTag } from "@/components/ui/price-tag";
import { cn } from "@/lib/utils";

interface WishlistProduct {
  slug: string;
  title: string;
  basePrice: number;
  compareAtPrice?: number;
  image?: { url: string; alt: string };
}

export default function WishlistPage() {
  const { items, toggle, clear } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Fetch product details for wishlisted slugs via search API
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wishlist-products?slugs=${items.join(",")}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // Silently fail — worst case they see empty list
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [items]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wishlist</h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border p-8 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save items you love by tapping the heart icon.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Explore Products
          </Link>
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: items.length }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-sm bg-muted" />
              <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <div key={product.slug} className="group relative flex flex-col">
              <Link
                href={`/products/${product.slug}`}
                className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-muted"
              >
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4">
                    <span className="text-center text-xs text-muted-foreground">{product.title}</span>
                  </div>
                )}
              </Link>

              {/* Remove from wishlist */}
              <button
                type="button"
                onClick={() => toggle(product.slug)}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-destructive shadow-sm transition-transform hover:scale-110"
                aria-label="Remove from wishlist"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>

              <div className="mt-3 flex flex-col gap-1 px-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-medium leading-tight text-foreground line-clamp-2 hover:underline"
                >
                  {product.title}
                </Link>
                <PriceTag price={product.basePrice} compareAtPrice={product.compareAtPrice} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
