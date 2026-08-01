"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
] as const;

const GENDERS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
] as const;

/** Full-height row so every option clears the 44px minimum touch target. */
function CheckRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 -mx-1 transition-colors hover:bg-secondary/60">
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="sr-only"
        />
      </span>
      <span className={cn("text-sm", checked ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </label>
  );
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

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === currentSort)?.label || "Sort By";

  // Drives the badge on the mobile Filters button so state is visible while collapsed.
  const activeCount = [currentCategory, currentGender, inStock ? "1" : ""].filter(Boolean).length;

  const menCats = categories.filter((c) => c.parentId && c.slug.startsWith("men-"));
  const womenCats = categories.filter((c) => c.parentId && c.slug.startsWith("women-"));

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    router.push(`/shop${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  const filterContent = (
    <div className="space-y-7">
      {/* Gender */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider">Gender</h3>
        <div>
          {GENDERS.map((g) => (
            <CheckRow
              key={g.value}
              label={g.label}
              checked={currentGender === g.value}
              onToggle={() => updateFilter("gender", currentGender === g.value ? "" : g.value)}
            />
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider">Category</h3>
        <div className="space-y-4">
          {[
            { heading: "Men", cats: menCats },
            { heading: "Women", cats: womenCats },
          ].map(
            (group) =>
              group.cats.length > 0 && (
                <div key={group.heading}>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {group.heading}
                  </p>
                  <div>
                    {group.cats.map((cat) => (
                      <CheckRow
                        key={String(cat._id)}
                        label={cat.name}
                        checked={currentCategory === cat.slug}
                        onToggle={() =>
                          updateFilter("category", currentCategory === cat.slug ? "" : cat.slug)
                        }
                      />
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      {/* In Stock */}
      <div className="flex min-h-11 items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider">In Stock Only</span>
        <button
          type="button"
          onClick={() => updateFilter("inStock", inStock ? "" : "true")}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
            inStock ? "bg-primary" : "bg-border",
          )}
          role="switch"
          aria-checked={inStock}
          aria-label="In stock only"
        >
          <span
            className={cn(
              "inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
              inStock ? "translate-x-[1.375rem]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: filter + sort control bar */}
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 transition-transform", sortOpen && "rotate-180")}
            />
          </button>
          {sortOpen && (
            <>
              {/* Click-away layer — dropdowns that only close via re-tap feel broken on touch */}
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border bg-background p-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      updateFilter("sort", opt.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm transition-colors hover:bg-secondary",
                      currentSort === opt.value && "bg-secondary font-medium",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile: filter drawer — sticky header/footer with a scrollable middle */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="-mr-2 rounded-full p-2 transition-colors hover:bg-secondary"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {filterContent}
            </div>

            <div className="flex shrink-0 gap-3 border-t border-border px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={clearAll}
                disabled={activeCount === 0}
                className="min-h-11 flex-1 rounded-lg border text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="min-h-11 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Show results
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop: sidebar */}
      <aside className="hidden lg:block">
        <div className="mb-8">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider">Sort By</h3>
          <div className="space-y-1 text-sm">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilter("sort", opt.value)}
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary",
                  currentSort === opt.value && "bg-secondary font-medium text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filterContent}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-8 w-full rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Clear all filters
          </button>
        )}
      </aside>
    </>
  );
}

export { ShopFilters };
