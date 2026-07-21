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
  const inStock = searchParams.get("inStock") === "true";

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

  return (
    <div className="space-y-8">
      {/* Gender Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Gender
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          {[
            { value: "men", label: "Men" },
            { value: "women", label: "Women" },
          ].map((g) => (
            <label key={g.value} className="group flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={currentGender === g.value}
                onChange={() => updateFilter("gender", currentGender === g.value ? "" : g.value)}
                className="h-4 w-4 rounded-sm border-border text-foreground focus:ring-foreground"
              />
              <span className="transition-colors group-hover:text-foreground">{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Category
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          {categories
            .filter((c) => c.parentId)
            .map((cat) => (
              <label key={String(cat._id)} className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={currentCategory === cat.slug}
                  onChange={() =>
                    updateFilter("category", currentCategory === cat.slug ? "" : cat.slug)
                  }
                  className="h-4 w-4 rounded-sm border-border text-foreground focus:ring-foreground"
                />
                <span className="transition-colors group-hover:text-foreground">{cat.name}</span>
              </label>
            ))}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          In Stock Only
        </span>
        <button
          type="button"
          onClick={() => updateFilter("inStock", inStock ? "" : "true")}
          className={cn(
            "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
            inStock ? "bg-foreground" : "bg-border",
          )}
          role="switch"
          aria-checked={inStock}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              inStock ? "translate-x-4" : "translate-x-0",
            )}
          />
        </button>
      </div>
    </div>
  );
}

export { ShopFilters };
