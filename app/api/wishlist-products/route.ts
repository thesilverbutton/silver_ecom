import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";

/**
 * GET /api/wishlist-products?slugs=slug1,slug2,slug3
 * Returns minimal product data for the wishlist page.
 */
export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("slugs");
  if (!slugsParam) {
    return NextResponse.json({ products: [] });
  }

  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50); // Cap at 50 to prevent abuse

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  await connectDB();

  const products = await Product.find({
    slug: { $in: slugs },
    status: "active",
  })
    .select("slug title basePrice compareAtPrice images")
    .lean();

  const result = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    image: p.images?.[0] ? { url: p.images[0].url, alt: p.images[0].alt } : undefined,
  }));

  return NextResponse.json({ products: result });
}
