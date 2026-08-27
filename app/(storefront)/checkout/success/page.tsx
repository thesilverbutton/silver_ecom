import Link from "next/link";
import { CheckCircle, Clock3 } from "lucide-react";
import { Container } from "@/components/layout/section";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { Customer } from "@/models/customer.model";
import { verifyCashfreePayment } from "@/services/payment.service";
import { CreateAccountPrompt } from "./create-account-prompt";
import { CartClearer } from "./cart-clearer";
import { CopyOrderId } from "./copy-order-id";

interface PageProps {
  searchParams: Promise<{ order?: string; order_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber = params.order || "";
  const cashfreeOrderId = params.order_id || "";

  if (cashfreeOrderId) {
    await verifyCashfreePayment(cashfreeOrderId);
  }

  const session = await auth();
  const isLoggedIn = !!session?.user?.email;

  // Look up order to get the checkout email
  let orderEmail = "";
  let orderName = "";
  let orderPhone = "";
  let accountExists = false;
  let paymentStatus = "unpaid";
  let fulfillmentStatus = "unfulfilled";
  let orderStatus = "pending";

  if (orderNumber) {
    await connectDB();
    const order = await Order.findOne({ orderNumber })
      .select("email shippingAddress phone status paymentStatus fulfillmentStatus")
      .lean();

    if (order) {
      orderEmail = order.email || "";
      orderName = order.shippingAddress?.fullName || "";
      orderPhone = order.phone || "";
      paymentStatus = order.paymentStatus;
      fulfillmentStatus = order.fulfillmentStatus;
      orderStatus = order.status;

      if (!isLoggedIn) {
        const existing = await Customer.findOne({ email: orderEmail.toLowerCase() })
          .select("_id")
          .lean();
        accountExists = !!existing;
      }
    }
  }

  const isPaymentConfirmed = paymentStatus === "paid";
  const deliveryLabel = orderStatus === "delivered"
    ? "Delivered"
    : orderStatus === "shipped"
      ? "Shipped"
      : fulfillmentStatus === "processing"
        ? "Preparing your order"
        : "Starts after payment confirmation";
  const heading = orderStatus === "delivered"
    ? "Your order has been delivered"
    : orderStatus === "shipped"
      ? "Your order is on the way"
      : isPaymentConfirmed
        ? "Payment received"
        : paymentStatus === "failed"
          ? "Payment was not completed"
          : "Confirming your payment";
  const description = orderStatus === "delivered"
    ? "Your package has arrived. Thank you for shopping with us."
    : orderStatus === "shipped"
      ? "Your package is with the courier. Use Track Order for the latest delivery updates."
      : isPaymentConfirmed
        ? "Your payment is confirmed. We are preparing your order for dispatch."
        : "This can take a moment. If you were charged, do not pay again; check the status below shortly.";
  const refreshUrl = `/checkout/success?order=${encodeURIComponent(orderNumber)}${cashfreeOrderId ? `&order_id=${encodeURIComponent(cashfreeOrderId)}` : ""}`;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center bg-muted/20 py-16">
      <Container>
        {isPaymentConfirmed && <CartClearer />}
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
          
          {/* Header Section */}
          <div className="bg-primary/5 p-8 text-center sm:p-10">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-8 ${isPaymentConfirmed ? "bg-emerald-100 ring-emerald-50" : "bg-amber-100 ring-amber-50"}`}>
              {isPaymentConfirmed ? (
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              ) : (
                <Clock3 className="h-10 w-10 text-amber-700" />
              )}
            </div>
            
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight">{heading}</h1>
            
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {description}
            </p>

            {orderNumber && <CopyOrderId orderId={orderNumber} />}

            <div className="mt-6 grid gap-2 text-left text-sm sm:grid-cols-2">
              <div className="rounded-lg border bg-background px-4 py-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Payment</p>
                <p className="mt-1 font-semibold">{isPaymentConfirmed ? "Paid" : "Awaiting confirmation"}</p>
              </div>
              <div className="rounded-lg border bg-background px-4 py-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Delivery</p>
                <p className="mt-1 font-semibold">{deliveryLabel}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t p-8 sm:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {!isPaymentConfirmed ? (
                <Link
                  href={refreshUrl}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Check Payment Status
                </Link>
              ) : isLoggedIn ? (
                <Link
                  href="/account/orders"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View Orders
                </Link>
              ) : (
                <Link
                  href={`/track-order`}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Track Order
                </Link>
              )}
              <Link
                href="/shop"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Post-purchase account prompt for guests */}
            {!isLoggedIn && isPaymentConfirmed && orderNumber && (
              <div className="mt-10 pt-8 border-t border-dashed">
                {accountExists ? (
                  <div className="rounded-xl border bg-muted/40 p-6 text-center sm:text-left">
                    <h3 className="font-semibold text-foreground">You already have an account!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Log in with <span className="font-medium text-foreground">{orderEmail}</span> to easily view your order history and track deliveries.
                    </p>
                    <Link
                      href={`/login?next=/account/orders`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 sm:w-auto"
                    >
                      Log In to View Orders
                    </Link>
                  </div>
                ) : (
                  <CreateAccountPrompt
                    email={orderEmail}
                    name={orderName}
                    phone={orderPhone}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
