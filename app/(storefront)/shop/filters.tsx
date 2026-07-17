"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
  const currentCategory = searchParams.get("category") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Gender</h3>
        <div className="space-y-1">
          {["", "men", "women"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateFilter("gender", g)}
              className={cn(
                "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                currentGender === g && "bg-secondary font-medium text-foreground",
              )}
            >
              {g === "" ? "All" : g === "men" ? "Men" : "Women"}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Category</h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateFilter("category", "")}
            className={cn(
              "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
              !currentCategory && "bg-secondary font-medium",
            )}
          >
            All
          </button>
          {categories
            .filter((c) => c.parentId) // show only sub-categories
            .map((cat) => (
              <button
                key={String(cat._id)}
                type="button"
                onClick={() => updateFilter("category", cat.slug)}
                className={cn(
                  "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                  currentCategory === cat.slug && "bg-secondary font-medium",
                )}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Sort by</h3>
        <div className="space-y-1">
          {[
            { value: "newest", label: "Newest" },
            { value: "price_asc", label: "Price: Low → High" },
            { value: "price_desc", label: "Price: High → Low" },
            { value: "popular", label: "Most Popular" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter("sort", opt.value)}
              className={cn(
                "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                currentSort === opt.value && "bg-secondary font-medium",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <button
          type="button"
          onClick={() =>
            updateFilter("inStock", searchParams.get("inStock") === "true" ? "" : "true")
          }
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-secondary",
            searchParams.get("inStock") === "true" && "border-primary bg-primary/5 font-medium",
          )}
        >
          In Stock Only
        </button>
      </div>
    </div>
  );
}

export { ShopFilters };
