import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { getOrdersByEmail } from "@/services/order.service";
import { auth } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your order history.",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?next=/account/orders");

  const result = await getOrdersByEmail(session.user.email);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  const statusLabels: Record<string, string> = {
    pending: "Awaiting payment",
    paid: "Payment received",
    processing: "Preparing for shipment",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{result.total} orders</p>

      {result.items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will appear here.</p>
          <Link href="/shop" className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {result.items.map((order) => (
            <Link
              key={order.orderNumber}
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50"
            >
              {/* First item image */}
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {order.items[0]?.image && (
                  <Image src={order.items[0].image} alt="" fill className="object-cover" sizes="48px" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>

              <p className="text-sm font-semibold">{formatINR(order.grandTotal)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
