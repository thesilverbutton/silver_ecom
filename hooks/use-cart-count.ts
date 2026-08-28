"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "@/actions/cart";

const CART_UPDATED_EVENT = "cart:updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function useCartCount(initialValue = 0) {
  const [cartCount, setCartCount] = useState(initialValue);

  useEffect(() => {
    let active = true;

    const refreshCartCount = () => {
      getCartCount().then((count) => {
        if (active) setCartCount(count);
      });
    };

    refreshCartCount();
    window.addEventListener(CART_UPDATED_EVENT, refreshCartCount);

    return () => {
      active = false;
      window.removeEventListener(CART_UPDATED_EVENT, refreshCartCount);
    };
  }, []);

  return cartCount;
}