import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { formatINR } from "@/lib/utils";
import { Package, ShoppingCart, IndianRupee, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  await connectDB();

  const now = new Date();
  const today = new Date(now.toISOString().slice(0, 10));
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    todayOrders,
    revenue7d,
    revenue30d,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments({ status: { $ne: "cancelled" } }),
    Order.countDocuments({ createdAt: { $gte: today }, status: { $ne: "cancelled" } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    Order.countDocuments({ status: { $in: ["paid", "processing"] } }),
    Product.countDocuments({
      status: "active",
      $or: [
        { hasVariants: false, stock: { $lte: 3 } },
        { hasVariants: true, "variants.stock": { $lte: 3 } },
      ],
    }),
    Order.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber email status grandTotal createdAt")
      .lean(),
  ]);

  const rev7d = revenue7d[0]?.total || 0;
  const rev30d = revenue30d[0]?.total || 0;
  const aov = totalOrders > 0 ? Math.round(rev30d / totalOrders) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your store</p>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={<IndianRupee className="h-5 w-5" />} label="Revenue (7d)" value={formatINR(rev7d)} />
        <KPICard icon={<IndianRupee className="h-5 w-5" />} label="Revenue (30d)" value={formatINR(rev30d)} />
        <KPICard icon={<ShoppingCart className="h-5 w-5" />} label="Orders Today" value={String(todayOrders)} />
        <KPICard icon={<ShoppingCart className="h-5 w-5" />} label="AOV" value={formatINR(aov)} />
      </div>

      {/* Action items */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pending / Processing</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingOrders}</p>
          <Link href="/admin/orders?status=paid,processing" className="mt-2 text-xs text-primary hover:underline">
            View orders →
          </Link>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Low Stock</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{lowStockProducts}</p>
          <Link href="/admin/products?stock=low" className="mt-2 text-xs text-primary hover:underline">
            View products →
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.orderNumber} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="font-medium text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(order.grandTotal)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
