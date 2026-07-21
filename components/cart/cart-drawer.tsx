"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import { updateCartItem, removeCartItem, applyCoupon, removeCoupon } from "@/actions/cart";
import type { ResolvedCart } from "@/services/cart.service";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: ResolvedCart;
  onCartUpdate: () => void;
}

function CartDrawer({ open, onClose, cart, onCartUpdate }: CartDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleQuantityChange = (productId: string, newQty: number, variantId?: string) => {
    startTransition(async () => {
      await updateCartItem(productId, newQty, variantId);
      onCartUpdate();
    });
  };

  const handleRemove = (productId: string, variantId?: string) => {
    startTransition(async () => {
      await removeCartItem(productId, variantId);
      onCartUpdate();
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    startTransition(async () => {
      const result = await applyCoupon(couponInput.trim());
      if (!result.success) {
        setCouponError(result.error || "Invalid coupon");
      } else {
        setCouponInput("");
      }
      onCartUpdate();
    });
  };

  const handleRemoveCoupon = () => {
    startTransition(async () => {
      await removeCoupon();
      onCartUpdate();
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Your Cart ({cart.items.length})</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Start shopping to add items.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || ""}`}
                  className={cn("flex gap-4 py-4", item.flag && "opacity-60")}
                >
                  {/* Image */}
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm font-medium leading-tight line-clamp-2 hover:underline"
                        onClick={onClose}
                      >
                        {item.title}
                      </Link>
                      {item.options && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {Object.values(item.options).join(" / ")}
                        </p>
                      )}
                      {item.flag && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {item.flag === "OUT_OF_STOCK" && "Out of stock"}
                          {item.flag === "QTY_REDUCED" && "Quantity reduced to available stock"}
                          {item.flag === "REMOVED" && "Product no longer available"}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity */}
                      {!item.flag || item.flag === "QTY_REDUCED" ? (
                        <div className="inline-flex items-center rounded-md border">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.variantId)}
                            disabled={isPending || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center hover:bg-secondary disabled:opacity-50"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.variantId)}
                            disabled={isPending || item.quantity >= item.stock}
                            className="flex h-8 w-8 items-center justify-center hover:bg-secondary disabled:opacity-50"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{formatINR(item.lineTotal)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.productId, item.variantId)}
                          disabled={isPending}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (totals + coupon) */}
        {cart.items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4">
            {/* Coupon */}
            {cart.couponCode ? (
              <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">{cart.couponCode}</span>
                  {cart.totals.discountTotal > 0 && (
                    <span className="text-xs text-success">-{formatINR(cart.totals.discountTotal)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isPending || !couponInput.trim()}
                  className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}
            {cart.couponError && <p className="text-xs text-destructive">{cart.couponError}</p>}

            {/* Totals */}
            <div className="space-y-1 text-sm">
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
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(cart.totals.grandTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              View Cart & Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export { CartDrawer };
