"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Clock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  images: { url: string; alt: string }[];
  basePrice: number;
  gender: string;
  fabric: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "tsb_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.ok) {
        setResults(json.data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      saveRecentSearch(query.trim());
      onClose();
      window.location.href = `/shop?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    search(term);
  };

  const handleResultClick = () => {
    if (query.trim().length >= 2) {
      saveRecentSearch(query.trim());
    }
    onClose();
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!open) return null;

  const showRecent = query.length === 0 && recentSearches.length > 0;
  const showResults = query.length >= 2;
  const noResults = showResults && !loading && results.length === 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="relative mx-auto w-full max-w-2xl pt-20 px-4 md:pt-24">
        <div className="rounded-xl border border-border bg-background shadow-2xl">
          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent px-3 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && !loading && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Content area */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {/* Recent searches */}
            {showRecent && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <ul className="space-y-1">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => handleRecentClick(term)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prompt */}
            {query.length > 0 && query.length < 2 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </p>
            )}

            {/* No results */}
            {noResults && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No products found for &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different term or browse our collections
                </p>
              </div>
            )}

            {/* Results */}
            {showResults && results.length > 0 && (
              <div>
                <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Products
                </span>
                <ul className="space-y-1">
                  {results.map((product) => (
                    <li key={product._id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-secondary"
                      >
                        {/* Product image */}
                        <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-foreground">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.title}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-[8px] text-background/60">No img</span>
                            </div>
                          )}
                        </div>
                        {/* Product info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.fabric} · {product.gender === "men" ? "Men" : "Women"}
                          </p>
                        </div>
                        {/* Price */}
                        <span className="flex-shrink-0 text-sm font-medium text-foreground">
                          {formatINR(product.basePrice)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* View all link */}
                {results.length >= 8 && (
                  <Link
                    href={`/shop?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="mt-4 flex items-center justify-center gap-1 rounded-md border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    View all results <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="border-t border-border px-4 py-2">
            <p className="text-center text-[11px] text-muted-foreground">
              Press <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-medium">ESC</kbd> to close
              {" · "}
              <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-medium">↵</kbd> to search all
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SearchOverlay };
