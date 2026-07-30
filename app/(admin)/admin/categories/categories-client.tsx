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

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1); // step 1 = first confirm, step 2 = force confirm
  const [deleteProductCount, setDeleteProductCount] = useState(0);

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

  const handleDelete = (force = false) => {
    if (!deleteTarget) return;
    setDeleteError("");
    startTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id, force);
      if (!result.ok) {
        if ((result as { requiresForce?: boolean }).requiresForce) {
          // Products exist — show second confirmation
          setDeleteStep(2);
          setDeleteProductCount((result as { productCount?: number }).productCount || 0);
          setDeleteError("");
        } else {
          setDeleteError(result.error || "Failed to delete");
        }
      } else {
        setDeleteTarget(null);
        setDeleteStep(1);
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
                onClick={() => setDeleteTarget({ id: cat._id, name: cat.name })}
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
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setDeleteTarget(null); setDeleteError(""); setDeleteStep(1); }} />
          <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            {deleteStep === 1 ? (
              <>
                <h3 className="text-lg font-semibold text-destructive">Delete Category</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-medium text-foreground">&ldquo;{deleteTarget.name}&rdquo;</span>?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>

                {deleteError && (
                  <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(false)}
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {isPending ? "Checking..." : "Yes, Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeleteTarget(null); setDeleteError(""); setDeleteStep(1); }}
                    className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-destructive">⚠️ Final Confirmation</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  This category contains <span className="font-semibold text-foreground">{deleteProductCount} product(s)</span>.
                </p>
                <p className="mt-2 text-sm font-medium text-destructive">
                  Deleting will permanently remove all products in this category. This cannot be undone.
                </p>

                {deleteError && (
                  <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(true)}
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {isPending ? "Deleting..." : "Delete Category & All Products"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeleteTarget(null); setDeleteError(""); setDeleteStep(1); }}
                    className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
