"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, reason }),
      });
      const data = await res.json();
      if (data.ok) {
        router.refresh();
        setShowConfirm(false);
      } else {
        setError(data.error?.message || "Cancellation failed");
      }
    });
  };

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
      >
        Cancel Order
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4">
      <p className="text-sm font-medium">Are you sure you want to cancel this order?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        If paid, a refund will be initiated. This cannot be undone.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for cancellation..."
        className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
        rows={2}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? "Cancelling..." : "Confirm Cancel"}
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          Keep Order
        </button>
      </div>
    </div>
  );
}
