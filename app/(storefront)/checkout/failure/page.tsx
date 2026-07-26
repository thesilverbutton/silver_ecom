import Link from "next/link";
import { XCircle } from "lucide-react";
import { Container } from "@/components/layout/section";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutFailurePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber = params.order || "";

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">Payment Failed</h1>

        <p className="mt-3 text-muted-foreground">
          Your payment for order{" "}
          {orderNumber && <span className="font-semibold text-foreground">{orderNumber}</span>}{" "}
          could not be processed.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Don&apos;t worry — your order is saved. You can retry the payment or contact us for help.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/cart"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Retry Payment
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </Container>
  );
}
