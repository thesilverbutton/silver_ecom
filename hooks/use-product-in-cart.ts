"use client";

import { useEffect, useState } from "react";
import { isProductInCart } from "@/actions/cart";

export function useProductInCart(productId: string, initialValue = false) {
  const [isInCart, setIsInCart] = useState(initialValue);

  useEffect(() => {
    let active = true;

    if (!productId) return () => {
      active = false;
    };

    isProductInCart(productId).then((result) => {
      if (active) setIsInCart(result);
    });

    return () => {
      active = false;
    };
  }, [productId]);

  return [isInCart, setIsInCart] as const;
}