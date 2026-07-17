"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "tsb_wishlist";

function getInitialWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Guest wishlist stored in localStorage.
 * In later phases, this will sync to the DB for logged-in customers.
 */
export function useWishlist() {
  const [items, setItems] = useState<string[]>(getInitialWishlist);

  const persist = useCallback((updated: string[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const toggle = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const updated = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const isWishlisted = useCallback(
    (productId: string) => items.includes(productId),
    [items],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, toggle, isWishlisted, clear, count: items.length };
}
