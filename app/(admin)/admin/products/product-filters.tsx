"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  gender: "men" | "women";
}

interface Props {
  categories: Category[];
}

export function AdminProductFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentQ = searchParams.get("q") || "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/admin/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const hasFilters = currentGender || currentCategory || currentStatus || currentQ;

  const selectClass = "rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          defaultValue={currentQ}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
          placeholder="Search products..."
          className="rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Gender */}
      <select value={currentGender} onChange={(e) => setParam("gender", e.target.value)} className={selectClass}>
        <option value="">All Genders</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
        <option value="unisex">Unisex</option>
      </select>

      {/* Category */}
      <select value={currentCategory} onChange={(e) => setParam("category", e.target.value)} className={selectClass}>
        <option value="">All Categories</option>
        <optgroup label="Men">
          {categories.filter((c) => c.gender === "men").map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </optgroup>
        <optgroup label="Women">
          {categories.filter((c) => c.gender === "women").map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </optgroup>
      </select>

      {/* Status */}
      <select value={currentStatus} onChange={(e) => setParam("status", e.target.value)} className={selectClass}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
