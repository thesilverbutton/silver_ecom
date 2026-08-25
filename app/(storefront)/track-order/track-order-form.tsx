"use client";

import { useState, useTransition } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface OrderData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  grandTotal: number;
  items: Array<{ title: string; quantity: number; lineTotal: number; image?: string }>;
  createdAt: string;
  timeline: Array<{ at: string; status: string; note?: string }>;
  courierName?: string;
  awbCode?: string;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  paid: { icon: CheckCircle, color: "text-green-500", label: "Paid" },
  processing: { icon: Package, color: "text-blue-500", label: "Processing" },
  shipped: { icon: Truck, color: "text-indigo-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-600", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
  refunded: { icon: XCircle, color: "text-orange-500", label: "Refunded" },
};

export function TrackOrderForm() {
  const [isPending, startTransition] = useTransition();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim().toLowerCase() }),
        });
        const data = await res.json();

        if (!data.ok) {
          setError(data.error?.message || "Order not found");
          return;
        }

        setOrder(data.data);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const config = order ? statusConfig[order.status] || statusConfig.pending : null;

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Order Number</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="TSB-20260825-0001"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Looking up..." : "Track Order"}
        </button>
      </form>

      {order && config && (
        <div className="mt-8 space-y-6 rounded-lg border p-6">
          {/* Status Header */}
          <div className="flex items-center gap-3">
            <config.icon className={`h-6 w-6 ${config.color}`} />
            <div>
              <p className="font-semibold">{order.orderNumber}</p>
              <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
            </div>
            <p className="ml-auto text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Shipping Info */}
          {order.courierName && (
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm">
              <p><span className="font-medium">Courier:</span> {order.courierName}</p>
              {order.awbCode && <p><span className="font-medium">Tracking ID:</span> {order.awbCode}</p>}
            </div>
          )}

          {/* Items */}
          <div>
            <p className="mb-2 text-sm font-medium">Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="font-medium">{formatINR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Order Timeline</p>
              <div className="space-y-2">
                {order.timeline.slice().reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium capitalize">{entry.status}</p>
                      {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nudge to create account */}
          <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm">
            <p className="text-muted-foreground">
              Want easier tracking next time?{" "}
              <a href="/register" className="font-medium text-primary hover:underline">Create an account</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
