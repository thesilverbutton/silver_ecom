import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/services/product.service";
import { getAllCategories } from "@/services/category.service";
import { formatINR } from "@/lib/utils";
import { AdminProductFilters } from "./product-filters";
import { DeleteProductButton } from "./delete-product-button";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await getAdminProducts(
    {
      categoryId: params.category,
      gender: params.gender as "men" | "women" | "unisex" | undefined,
      status: params.status as "active" | "draft" | "archived" | undefined,
      q: params.q,
    },
    { page, limit: 20 },
  );

  const categories = await getAllCategories();
  const subCats = categories
    .filter((c) => c.parentId)
    .map((c) => ({
      _id: String(c._id),
      name: c.name,
      slug: c.slug,
      gender: (c.slug.startsWith("men-") ? "men" : "women") as "men" | "women",
    }));

  // Build query string for pagination that preserves filters
  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", params.category);
    if (params.gender) sp.set("gender", params.gender);
    if (params.status) sp.set("status", params.status);
    if (params.q) sp.set("q", params.q);
    sp.set("page", String(p));
    return `/admin/products?${sp.toString()}`;
  };

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

      {/* Filters */}
      <div className="mt-6">
        <AdminProductFilters categories={subCats} />
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
              <th className="px-4 py-3 text-right font-medium"></th>
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
                <td className="px-4 py-3 text-right">
                  <DeleteProductButton productId={String(product._id)} productTitle={product.title as string} />
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products match these filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <Link href={buildPageUrl(page - 1)} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Prev</Link>}
          <span className="px-3 py-1 text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          {page < result.totalPages && <Link href={buildPageUrl(page + 1)} className="rounded border px-3 py-1 text-sm hover:bg-secondary">Next</Link>}
        </div>
      )}
    </div>
  );
}
