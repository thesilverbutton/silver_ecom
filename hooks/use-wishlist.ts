"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "tsb_wishlist";

function getSnapshot(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): string[] {
  return [];
}

/** Storage-event-aware subscribers so multiple tabs stay in sync. */
const listeners = new Set<() => void>();
let cachedItems: string[] | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);

  function handleStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) {
      cachedItems = null;
      callback();
    }
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getCachedSnapshot(): string[] {
  if (cachedItems === null) {
    cachedItems = getSnapshot();
  }
  return cachedItems;
}

function notify() {
  cachedItems = null;
  listeners.forEach((fn) => fn());
}

/**
 * Guest wishlist stored in localStorage.
 * Works across tabs (via storage events) and avoids SSR hydration mismatches.
 */
export function useWishlist() {
  const items = useSyncExternalStore(subscribe, getCachedSnapshot, getServerSnapshot);

  const toggle = useCallback((productSlug: string) => {
    const current = getSnapshot();
    const updated = current.includes(productSlug)
      ? current.filter((id) => id !== productSlug)
      : [...current, productSlug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notify();
  }, []);

  const isWishlisted = useCallback(
    (productSlug: string) => items.includes(productSlug),
    [items],
  );

  const clear = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    notify();
  }, []);

  return { items, toggle, isWishlisted, clear, count: items.length };
}
