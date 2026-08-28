"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryLoader, getOptimizedCloudinaryUrl, isCloudinaryUrl } from "@/lib/cloudinary-utils";
import { formatINR } from "@/lib/utils";
import { notifyCartUpdated } from "@/hooks/use-cart-count";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/actions/cart";
import type { ResolvedCart } from "@/services/cart.service";

interface CartPageClientProps {
  initialCart: ResolvedCart;
}

function CartPageClient({ initialCart }: CartPageClientProps) {
  const [cart, setCart] = useState(initialCart);
  const [isPending, startTransition] = useTransition();


  const handleQuantityChange = (productId: string, newQty: number, variantId?: string) => {
    startTransition(async () => {
      await updateCartItem(productId, newQty, variantId);
      const updated = await getCart();
      setCart(updated);
      notifyCartUpdated();
    });
  };

  const handleRemove = (productId: string, variantId?: string) => {
    startTransition(async () => {
      await removeCartItem(productId, variantId);
      const updated = await getCart();
      setCart(updated);
      notifyCartUpdated();
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      await clearCart();
      const updated = await getCart();
      setCart(updated);
      notifyCartUpdated();
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-xl font-medium">Your cart is empty</p>
        <p className="mt-2 text-muted-foreground">Add some items and come back here.</p>
        <Link
          href="/shop"
          className="mt-6 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Items */}
      <div>
        <div className="flex items-center justify-between border-b pb-4">
          <p className="text-sm text-muted-foreground">{cart.items.length} items</p>
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear Cart
          </button>
        </div>

        <div className="divide-y">
          {cart.items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || ""}`}
              className={cn("flex gap-4 py-5", item.flag && "opacity-60")}
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image && (
                  <Image src={getOptimizedCloudinaryUrl(item.image, 160)} loader={isCloudinaryUrl(item.image) ? cloudinaryLoader : undefined} alt={item.title} fill className="object-cover" sizes="80px" />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                    {item.title}
                  </Link>
                  {item.options && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                  {item.flag && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {item.flag === "OUT_OF_STOCK" && "Out of stock — remove to proceed"}
                      {item.flag === "QTY_REDUCED" && "Quantity reduced to available stock"}
                      {item.flag === "REMOVED" && "Product no longer available"}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {!item.flag || item.flag === "QTY_REDUCED" ? (
                    <div className="inline-flex items-center rounded-md border">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.variantId)}
                        disabled={isPending || item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center hover:bg-secondary disabled:opacity-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.variantId)}
                        disabled={isPending || item.quantity >= item.stock}
                        className="flex h-9 w-9 items-center justify-center hover:bg-secondary disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatINR(item.lineTotal)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId, item.variantId)}
                      disabled={isPending}
                      className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="rounded-lg border p-6 h-fit sticky top-28">
        <h2 className="text-lg font-semibold">Order Summary</h2>

        {/* Totals */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(cart.totals.subtotal)}</span>
          </div>
          {cart.totals.discountTotal > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>-{formatINR(cart.totals.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{cart.totals.shippingTotal === 0 ? "Free" : formatINR(cart.totals.shippingTotal)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg font-semibold">
            <span>Total</span>
            <span>{formatINR(cart.totals.grandTotal)}</span>
          </div>
          {cart.totals.shippingTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              Free shipping on orders above ₹999
            </p>
          )}
        </div>

        {/* Checkout CTA */}
        <Link
          href="/checkout"
          className={`mt-6 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 ${!cart.valid ? "pointer-events-none opacity-50" : ""}`}
        >
          Proceed to Checkout
        </Link>

        {!cart.valid && (
          <p className="mt-2 text-center text-xs text-destructive">
            Please resolve flagged items before checkout.
          </p>
        )}
      </div>
    </div>
  );
}

export { CartPageClient };
