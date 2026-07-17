import { NextRequest } from "next/server";
import { searchProducts } from "@/services/product.service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return Response.json({ ok: true, data: [] });
  }

  try {
    const results = await searchProducts(q, 8);
    return Response.json({ ok: true, data: results });
  } catch {
    return Response.json({ ok: false, error: { code: "INTERNAL", message: "Search failed" } }, { status: 500 });
  }
}
