"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/actions/category";

interface Category {
  _id: string;
  name: string;
  slug: string;
  gender: "men" | "women";
  productCount: number;
}

interface Props {
  menCategories: Category[];
  womenCategories: Category[];
}

export function CategoriesClient({ menCategories, womenCategories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"men" | "women">("men");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createCategoryAction({ name, gender });
      if (result.ok) {
        setShowModal(false);
        setName("");
        router.refresh();
      } else {
        setError(result.error || "Failed");
      }
    });
  };

  const handleDelete = (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const renderGroup = (title: string, cats: Category[]) => (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">
        {cats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          cats.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30">
              <Link href={`/admin/products?category=${cat._id}`} className="flex-1">
                <p className="text-sm font-medium hover:underline">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.productCount} product{cat.productCount !== 1 ? "s" : ""} · View products →
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(cat._id, cat.name)}
                disabled={isPending}
                className="rounded p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organized under Men and Women</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {renderGroup("Men", menCategories)}
        {renderGroup("Women", womenCategories)}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Add Category</h3>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as "men" | "women")} className="w-full rounded-lg border px-3 py-2.5 text-sm">
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Category Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="e.g. Linen Shirts" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {isPending ? "Adding..." : "Add Category"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
