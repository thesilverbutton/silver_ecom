import type { Metadata } from "next";
import { Container } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TrackOrderForm } from "./track-order-form";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your order status using your order number and email.",
};

export default function TrackOrderPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <div className="mx-auto mt-8 max-w-lg">
        <h1 className="text-2xl font-bold">Track Your Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your order number and the email you used during checkout.
        </p>
        <TrackOrderForm />
      </div>
    </Container>
  );
}
