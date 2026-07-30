import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { formatINR } from "@/lib/utils";
import { OrderFilters } from "./components/order-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  await connectDB();

  const query: Record<string, unknown> = {};
  if (params.status) query.status = { $in: params.status.split(",") };
  if (params.paymentStatus) query.paymentStatus = { $in: params.paymentStatus.split(",") };
  if (params.fulfillmentStatus) query.fulfillmentStatus = { $in: params.fulfillmentStatus.split(",") };
  if (params.search) {
    query.$or = [
      { orderNumber: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
      { phone: { $regex: params.search, $options: "i" } },
    ];
  }

  const baseParams = new URLSearchParams();
  if (params.search) baseParams.set("search", params.search);
  if (params.status) baseParams.set("status", params.status);
  if (params.paymentStatus) baseParams.set("paymentStatus", params.paymentStatus);
  if (params.fulfillmentStatus) baseParams.set("fulfillmentStatus", params.fulfillmentStatus);
  const baseQueryString = baseParams.toString();
  const getPageUrl = (p: number) => `/admin/orders?page=${p}${baseQueryString ? `&${baseQueryString}` : ""}`;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("orderNumber email phone status paymentStatus fulfillmentStatus grandTotal createdAt").lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">{total} total</p>

      <OrderFilters />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Payment</th>
              <th className="px-4 py-3 text-left font-medium">Fulfillment</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.orderNumber} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="font-medium text-primary hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{order.email}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={order.fulfillmentStatus} /></td>
                <td className="px-4 py-3 text-right font-medium">{formatINR(order.grandTotal)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <Link href={getPageUrl(page - 1)} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Prev</Link>}
          <span className="px-3 py-1 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={getPageUrl(page + 1)} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Next</Link>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
    unpaid: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    unfulfilled: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${colors[status] || "bg-gray-100"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
