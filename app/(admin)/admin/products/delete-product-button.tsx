"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/actions/product";

interface Props {
  productId: string;
  productTitle: string;
}

export function DeleteProductButton({ productId, productTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result.ok) {
        setShowModal(false);
        router.refresh();
      } else {
        setError(result.error || "Failed");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
        aria-label="Delete product"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-destructive">Delete Product</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">&ldquo;{productTitle}&rdquo;</span>?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove the product. This cannot be undone.
            </p>

            {error && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
