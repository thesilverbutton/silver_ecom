import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/coupon.model";
import { formatINR } from "@/lib/utils";

export default async function AdminCouponsPage() {
  await connectDB();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold">Coupons</h1>
      <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Value</th>
              <th className="px-4 py-3 text-left font-medium">Usage</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((c) => (
              <tr key={String(c._id)} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {c.type.replace("_", " ")}
                </td>
                <td className="px-4 py-3">
                  {c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? formatINR(c.value) : "Free Ship"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No coupons</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
