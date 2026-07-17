"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "tsb_recently_viewed";
const MAX_ITEMS = 12;

interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
}

function getInitialRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Recently viewed products stored in localStorage.
 * Client-only; shown as a rail on PDP and home.
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>(getInitialRecentlyViewed);

  const add = useCallback((product: RecentProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { items, add };
}
