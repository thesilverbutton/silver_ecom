import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Truck, MapPin, Clock } from "lucide-react";
import { getOrderByNumber } from "@/services/order.service";
import { auth } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { CancelOrderButton } from "./cancel-button";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login?next=/account/orders");

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  // Ownership: check email matches (works for both customer + guest orders)
  if (order.email.toLowerCase() !== session.user.email.toLowerCase()) {
    notFound();
  }

  const canCancel = ["pending", "paid", "processing"].includes(order.status);
  const orderAge = (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const cancelAllowed = canCancel && orderAge <= 7;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Orders
          </Link>
          <h1 className="mt-2 text-xl font-bold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusColors[order.status] || "bg-gray-100"}`}>
          {order.status}
        </span>
      </div>

      {/* Tracking */}
      {order.awbCode && (
        <div className="mt-6 rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tracking</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.courierName && <span>{order.courierName} · </span>}
            AWB: <span className="font-mono">{order.awbCode}</span>
          </p>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              Track Shipment →
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold">Items</h2>
        <div className="mt-3 divide-y rounded-lg border">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 p-4">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.options && (
                  <p className="text-xs text-muted-foreground">{Object.values(item.options).join(" / ")}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatINR(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 rounded-lg border p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>-{formatINR(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{order.shippingTotal === 0 ? "Free" : formatINR(order.shippingTotal)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{formatINR(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mt-6 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Shipping Address</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          <p>{order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Order Timeline</span>
        </div>
        <div className="mt-3 space-y-3">
          {order.timeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium capitalize">{event.status.replace(/_/g, " ")}</p>
                {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                <p className="text-xs text-muted-foreground">
                  {new Date(event.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel button */}
      {cancelAllowed && (
        <div className="mt-6">
          <CancelOrderButton orderNumber={order.orderNumber} />
        </div>
      )}
    </div>
  );
}
