import { auth } from "@/lib/auth";
import Link from "next/link";
import { getOrdersByEmail } from "@/services/order.service";
import { formatINR } from "@/lib/utils";
import { Package, ArrowRight } from "lucide-react";

export default async function AccountOverview() {
  const session = await auth();
  if (!session) return null;

  const orders = await getOrdersByEmail(session.user.email, { limit: 3 });

  return (
    <div>
      <h2 className="text-lg font-semibold">Account Overview</h2>

      {/* Quick stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{orders.total}</p>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">
            {orders.items.filter((o) => ["paid", "processing", "shipped"].includes(o.status)).length}
          </p>
          <p className="text-sm text-muted-foreground">Active Orders</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">
            {orders.items.filter((o) => o.status === "delivered").length}
          </p>
          <p className="text-sm text-muted-foreground">Delivered</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.items.length === 0 ? (
          <div className="mt-4 rounded-lg border p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Your orders will appear here.</p>
            <Link href="/shop" className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y rounded-lg border">
            {orders.items.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatINR(order.grandTotal)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
