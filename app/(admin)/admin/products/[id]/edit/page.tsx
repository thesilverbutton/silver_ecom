import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { getAllCategories } from "@/services/category.service";
import { ProductEditForm } from "@/components/admin/product-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  const categories = await getAllCategories();

  // Serialize for client component
  const serializedProduct = {
    _id: String(product._id),
    title: product.title,
    description: product.description,
    shortDescription: product.shortDescription,
    categoryId: String(product.categoryId),
    gender: product.gender,
    images: product.images.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      label: img.label,
      alt: img.alt,
      width: img.width,
      height: img.height,
      position: img.position,
    })),
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    hasVariants: product.hasVariants,
    variants: product.variants.map((v) => ({
      sku: v.sku,
      options: v.options as Record<string, string>,
      priceDelta: v.priceDelta,
      stock: v.stock,
      isActive: v.isActive,
    })),
    stock: product.stock,
    fabric: product.fabric,
    weave: product.weave,
    color: product.color,
    pattern: product.pattern,
    occasion: product.occasion,
    fit: product.fit,
    careInstructions: product.careInstructions,
    madeIn: product.madeIn,
    tags: product.tags,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    status: product.status,
  };

  const serializedCategories = categories.map((c) => ({
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
      <h1 className="mt-2 text-2xl font-bold">Edit Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update details for &ldquo;{product.title}&rdquo;
      </p>

      <div className="mt-8">
        <ProductEditForm product={serializedProduct} categories={serializedCategories} />
      </div>
    </div>
  );
}
