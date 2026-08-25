"use client";

import { useEffect } from "react";
import { clearCart } from "@/actions/cart";

export function CartClearer() {
  useEffect(() => {
    // Fire and forget server action to clear cart cookie and revalidate
    clearCart().catch(() => {});
  }, []);

  return null;
}
