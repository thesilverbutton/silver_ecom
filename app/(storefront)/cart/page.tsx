import type { Metadata } from "next";
import { getCart } from "@/actions/cart";
import { Container } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartPageClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your shopping bag.",
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mt-6 text-2xl font-bold">Shopping Cart</h1>
      <CartPageClient initialCart={cart} />
    </Container>
  );
}
