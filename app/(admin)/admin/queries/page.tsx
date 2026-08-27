import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ContactQuery } from "@/models/contact-query.model";

type ContactQueryLean = {
  _id: unknown;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string | Date;
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminQueriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  await connectDB();

  const query: Record<string, unknown> = {};
  if (params.status) {
    query.status = params.status;
  }
  if (params.search) {
    query.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
      { subject: { $regex: params.search, $options: "i" } },
      { message: { $regex: params.search, $options: "i" } },
    ];
  }

  const baseParams = new URLSearchParams();
  if (params.search) baseParams.set("search", params.search);
  if (params.status) baseParams.set("status", params.status);
  const baseQueryString = baseParams.toString();
  const getPageUrl = (p: number) => `/admin/queries?page=${p}${baseQueryString ? `&${baseQueryString}` : ""}`;

  const [queries, total] = await Promise.all([
    ContactQuery.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactQuery.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold">Customer Queries</h1>
      <p className="text-sm text-muted-foreground mb-6">{total} queries received</p>

      {/* Filters (Simplified) */}
      <div className="mb-4 flex flex-wrap gap-4">
        <form className="flex w-full max-w-sm gap-2">
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search queries..."
            className="flex-1 rounded-md border bg-background px-3 py-1 text-sm"
          />
          <button type="submit" className="rounded-md bg-secondary px-3 py-1 text-sm font-medium">
            Search
          </button>
        </form>
        <div className="flex gap-2">
          <Link href="/admin/queries" className={`rounded-md px-3 py-1 text-sm ${!params.status ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>All</Link>
          <Link href="/admin/queries?status=new" className={`rounded-md px-3 py-1 text-sm ${params.status === "new" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>New</Link>
          <Link href="/admin/queries?status=read" className={`rounded-md px-3 py-1 text-sm ${params.status === "read" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Read</Link>
          <Link href="/admin/queries?status=replied" className={`rounded-md px-3 py-1 text-sm ${params.status === "replied" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Replied</Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Contact Info</th>
              <th className="px-4 py-3 text-left font-medium">Message</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {queries.map((q: ContactQueryLean) => (
              <tr key={String(q._id)} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap align-top">
                  {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">{q.name}</div>
                  <div className="text-muted-foreground text-xs">{q.email}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium mb-1">{q.subject || "No Subject"}</div>
                  <p className="text-muted-foreground line-clamp-2 max-w-md" title={q.message}>{q.message}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    q.status === 'new' ? "bg-blue-100 text-blue-800" :
                    q.status === 'read' ? "bg-amber-100 text-amber-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {q.status}
                  </span>
                </td>
              </tr>
            ))}
            {queries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No queries found</td></tr>
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
