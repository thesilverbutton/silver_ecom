import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";

export default async function AdminCustomersPage() {
  await connectDB();
  const customers = await Customer.find({}).sort({ createdAt: -1 }).limit(50).select("name email phone isBlocked createdAt").lean();

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <p className="text-sm text-muted-foreground">{customers.length} customers</p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={String(c._id)} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {c.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
