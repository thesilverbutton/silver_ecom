import type { Metadata } from "next";
import { getCart } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";
import { Container } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CheckoutClient } from "./checkout-client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase.",
};

export default async function CheckoutPage() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  // Fetch saved addresses if logged in
  const session = await auth();
  let savedAddresses: Array<{
    _id: string;
    label?: string;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }> = [];
  let userEmail = "";
  let userPhone = "";

  if (session?.user?.email) {
    await connectDB();
    const customer = await Customer.findOne({ email: session.user.email })
      .select("addresses phone email")
      .lean();

    if (customer) {
      userEmail = customer.email;
      userPhone = customer.phone || "";
      savedAddresses = (customer.addresses || []).map((a) => ({
        _id: String(a._id),
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      }));
    }
  }

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-6 text-2xl font-bold">Checkout</h1>
      <CheckoutClient
        cart={cart}
        savedAddresses={savedAddresses}
        userEmail={userEmail}
        userPhone={userPhone}
      />
    </Container>
  );
}
