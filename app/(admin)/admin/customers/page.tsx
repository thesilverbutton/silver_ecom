import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";
import { CustomerFilters } from "./components/customer-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  await connectDB();

  const query: Record<string, unknown> = {};
  if (params.status === "active") query.isBlocked = false;
  if (params.status === "blocked") query.isBlocked = true;
  if (params.search) {
    query.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
      { phone: { $regex: params.search, $options: "i" } },
    ];
  }

  const baseParams = new URLSearchParams();
  if (params.search) baseParams.set("search", params.search);
  if (params.status) baseParams.set("status", params.status);
  const baseQueryString = baseParams.toString();
  const getPageUrl = (p: number) => `/admin/customers?page=${p}${baseQueryString ? `&${baseQueryString}` : ""}`;

  const [customers, total] = await Promise.all([
    Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("name email phone isBlocked createdAt").lean(),
    Customer.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <p className="text-sm text-muted-foreground mb-6">{total} customers</p>

      <CustomerFilters />

      <div className="overflow-x-auto rounded-lg border">
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
