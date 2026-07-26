"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { items, clear } = useWishlist();

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
      ) : (
        <div className="mt-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length > 1 ? "s" : ""} saved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Wishlist items are stored locally. Sign in on the same device to keep them.
          </p>
        </div>
      )}
    </div>
  );
}
