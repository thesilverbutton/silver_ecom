import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrderByNumber } from "@/services/order.service";
import { formatINR } from "@/lib/utils";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">← Back to Orders</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">{order.status}</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">{order.paymentStatus}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Items */}
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Items</h2>
          <div className="mt-3 divide-y">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 py-3">
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.options && <p className="text-xs text-muted-foreground">{Object.values(item.options).join(" / ")}</p>}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-medium">{formatINR(item.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discountTotal > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatINR(order.discountTotal)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingTotal === 0 ? "Free" : formatINR(order.shippingTotal)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatINR(order.grandTotal)}</span></div>
          </div>
        </div>

        {/* Customer + Address + Timeline */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Customer</h2>
            <p className="mt-2 text-sm">{order.email}</p>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
            {order.isGuest && <p className="mt-1 text-xs text-muted-foreground italic">Guest checkout</p>}
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Shipping Address</h2>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            </div>
          </div>

          {order.awbCode && (
            <div className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Shipping</h2>
              <p className="mt-2 text-sm">{order.courierName || "Courier"} — <span className="font-mono">{order.awbCode}</span></p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <div className="mt-3 space-y-2">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs font-medium capitalize">{event.status.replace(/_/g, " ")}</p>
                    {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(event.at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
