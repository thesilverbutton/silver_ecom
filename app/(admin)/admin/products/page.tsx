import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getProducts } from "@/services/product.service";
import { formatINR } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getProducts({ status: (params.status as "active" | "draft" | "archived") || undefined }, { page, limit: 20, sort: "newest" });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{result.total} products</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Gender</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {result.items.map((product: Record<string, unknown>) => (
              <tr key={String(product._id)} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${String(product._id)}/edit`} className="flex items-center gap-3 hover:underline">
                    <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-muted">
                      {(product.images as Array<{ url: string }>)?.[0]?.url && (
                        <Image src={(product.images as Array<{ url: string }>)[0]!.url} alt="" fill className="object-cover" sizes="32px" />
                      )}
                    </div>
                    <span className="font-medium line-clamp-1">{product.title as string}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${product.status === "active" ? "bg-green-100 text-green-800" : product.status === "draft" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>
                    {product.status as string}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{product.gender as string}</td>
                <td className="px-4 py-3 text-right">{formatINR(product.basePrice as number)}</td>
                <td className="px-4 py-3 text-right">{product.hasVariants ? "—" : String(product.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <Link href={`/admin/products?page=${page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Prev</Link>}
          <span className="px-3 py-1 text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          {page < result.totalPages && <Link href={`/admin/products?page=${page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Next</Link>}
        </div>
      )}
    </div>
  );
}
