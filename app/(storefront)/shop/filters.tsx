"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  _id: unknown;
  name: string;
  slug: string;
  parentId?: unknown;
}

interface ShopFiltersProps {
  categories: Category[];
}

function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const inStock = searchParams.get("inStock") === "true";

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const currentSortLabel = sortOptions.find((s) => s.value === currentSort)?.label || "Sort By";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filterContent = (
    <div className="space-y-8">
      {/* Gender */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider">Gender</h3>
        <div className="space-y-3 text-sm">
          {[{ value: "men", label: "Men" }, { value: "women", label: "Women" }].map((g) => (
            <label key={g.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={currentGender === g.value}
                onChange={() => updateFilter("gender", currentGender === g.value ? "" : g.value)}
                className="h-4 w-4 rounded-sm border-border"
              />
              <span className="text-muted-foreground hover:text-foreground">{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider">Category</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Men</p>
            <div className="space-y-3">
              {categories.filter((c) => c.parentId && c.slug.startsWith("men-")).map((cat) => (
                <label key={String(cat._id)} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={currentCategory === cat.slug}
                    onChange={() => updateFilter("category", currentCategory === cat.slug ? "" : cat.slug)}
                    className="h-4 w-4 rounded-sm border-border"
                  />
                  <span className="text-muted-foreground hover:text-foreground">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Women</p>
            <div className="space-y-3">
              {categories.filter((c) => c.parentId && c.slug.startsWith("women-")).map((cat) => (
                <label key={String(cat._id)} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={currentCategory === cat.slug}
                    onChange={() => updateFilter("category", currentCategory === cat.slug ? "" : cat.slug)}
                    className="h-4 w-4 rounded-sm border-border"
                  />
                  <span className="text-muted-foreground hover:text-foreground">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider">In Stock Only</span>
        <button
          type="button"
          onClick={() => updateFilter("inStock", inStock ? "" : "true")}
          className={cn(
            "relative inline-flex h-5 w-9 rounded-full transition-colors",
            inStock ? "bg-primary" : "bg-border",
          )}
          role="switch"
          aria-checked={inStock}
        >
          <span className={cn("inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform", inStock ? "translate-x-4" : "translate-x-0.5")} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: filter bar + sort */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        {/* Sort dropdown (mobile) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            {currentSortLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border bg-background p-1 shadow-md">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { updateFilter("sort", opt.value); setSortOpen(false); }}
                  className={cn("block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary", currentSort === opt.value && "bg-secondary font-medium")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded p-1 hover:bg-secondary" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </aside>
        </div>
      )}

      {/* Desktop: sidebar filters + sort */}
      <aside className="hidden lg:block">
        {/* Sort (desktop) */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider">Sort By</h3>
          <div className="space-y-2 text-sm">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilter("sort", opt.value)}
                className={cn("block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary", currentSort === opt.value && "bg-secondary font-medium text-foreground")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filterContent}
      </aside>
    </>
  );
}

export { ShopFilters };
