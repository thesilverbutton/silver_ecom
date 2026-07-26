import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Container } from "@/components/layout/section";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber = params.order || "";

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">Order Confirmed!</h1>

        <p className="mt-3 text-muted-foreground">
          Thank you for your purchase. Your order{" "}
          {orderNumber && <span className="font-semibold text-foreground">{orderNumber}</span>}{" "}
          has been placed successfully.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re confirming your payment. You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            View Orders
          </Link>
        </div>
      </div>
    </Container>
  );
}
