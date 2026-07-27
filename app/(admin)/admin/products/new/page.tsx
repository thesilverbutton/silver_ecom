import Link from "next/link";
import { getAllCategories } from "@/services/category.service";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  const serialized = categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ? String(c.parentId) : undefined,
  }));

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Products
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Add Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new product with images, variants, and details
      </p>

      <div className="mt-8">
        <ProductForm categories={serialized} />
      </div>
    </div>
  );
}
