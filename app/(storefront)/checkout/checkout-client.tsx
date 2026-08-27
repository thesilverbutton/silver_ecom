"use client";

import { useRef, useState, useTransition } from "react";
import Script from "next/script";
import Image from "next/image";
import { formatINR } from "@/lib/utils";
import type { ResolvedCart } from "@/services/cart.service";

interface SavedAddress {
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
}

interface CheckoutClientProps {
  cart: ResolvedCart;
  savedAddresses?: SavedAddress[];
  userEmail?: string;
  userPhone?: string;
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_modal" | "_self" | "_top" | "_blank";
      }) => Promise<{
        error?: { message?: string; code?: string };
        redirect?: boolean;
        paymentDetails?: Record<string, unknown>;
      }>;
    };
  }
}

type CashfreeClient = ReturnType<NonNullable<Window["Cashfree"]>>;

function CheckoutClient({ cart, savedAddresses = [], userEmail = "", userPhone = "" }: CheckoutClientProps) {
  const cashfreeRef = useRef<CashfreeClient | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    savedAddresses.find((a) => a.isDefault)?._id || savedAddresses[0]?._id || "new"
  );

  // Pre-fill from saved address or empty
  const defaultAddr = savedAddresses.find((a) => a._id === selectedAddressId) || savedAddresses[0];

  const [form, setForm] = useState({
    email: userEmail,
    phone: userPhone || defaultAddr?.phone || "",
    fullName: defaultAddr?.fullName || "",
    line1: defaultAddr?.line1 || "",
    line2: defaultAddr?.line2 || "",
    city: defaultAddr?.city || "",
    state: defaultAddr?.state || "",
    pincode: defaultAddr?.pincode || "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    form.email && form.phone.length >= 10 && form.fullName && form.line1 && form.city && form.state && form.pincode.length >= 6;

  const initializeCashfree = () => {
    if (!window.Cashfree || cashfreeRef.current) return;

    const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";
    cashfreeRef.current = window.Cashfree({ mode });
  };

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      setError("Please fill all required fields");
      return;
    }
    setError("");

    startTransition(async () => {
      try {
        // Step 1: Create order + Cashfree session
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            phone: form.phone,
            shippingAddress: {
              fullName: form.fullName,
              phone: form.phone,
              line1: form.line1,
              line2: form.line2 || undefined,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
              country: "India",
            },
          }),
        });

        const data = await res.json();
        if (!data.ok) {
          setError(data.error?.message || "Checkout failed. Please try again.");
          return;
        }

        if (!data.data?.paymentSessionId) {
          setError("Failed to initialize payment session. Please try again.");
          return;
        }

        if (!cashfreeRef.current) {
          setError("Payment gateway is initializing. Please wait a moment and try again.");
          return;
        }

        // Step 2: Open Cashfree Drop-in Checkout modal
        const result = await cashfreeRef.current.checkout({
          paymentSessionId: data.data.paymentSessionId,
          redirectTarget: "_modal",
        });

        // Step 3: Handle modal checkout terminal states
        if (result.error) {
          // Modal dismissed or client error
          setError("Payment was not completed. Your order is saved — you can try again.");
          return;
        }

        if (result.redirect) {
          // Redirection taking place
          return;
        }

        // Re-verify on backend with retry polling (essential for QR code payments completed on mobile)
        let isVerified = false;
        const maxAttempts = 5;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.data.orderId,
                orderNumber: data.data.orderNumber,
                cashfreeOrderId: data.data.cashfreeOrderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.ok && verifyData.data?.verified) {
              isVerified = true;
              break;
            }
          } catch {
            // Ignore temporary network errors during polling
          }

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        if (isVerified) {
          window.location.href = `/checkout/success?order=${data.data.orderNumber}`;
        } else {
          setError("Payment status is pending verification. If you were charged, your order will update shortly.");
          window.location.href = `/checkout/failure?order=${data.data.orderNumber}`;
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error("Checkout flow error:", err);
      }
    });
  };

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onReady={initializeCashfree}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: Address form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Shipping Address</h2>

            {/* Saved address selector */}
            {savedAddresses.length > 0 && (
              <div className="mt-4 space-y-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${selectedAddressId === addr._id ? "border-primary bg-primary/5" : "hover:bg-secondary/30"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => {
                        setSelectedAddressId(addr._id);
                        setForm((prev) => ({
                          ...prev,
                          fullName: addr.fullName,
                          phone: addr.phone || prev.phone,
                          line1: addr.line1,
                          line2: addr.line2 || "",
                          city: addr.city,
                          state: addr.state,
                          pincode: addr.pincode,
                        }));
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{addr.fullName}</span>
                        {addr.label && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase">{addr.label}</span>}
                        {addr.isDefault && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 transition-colors ${selectedAddressId === "new" ? "border-primary bg-primary/5" : "hover:bg-secondary/30"}`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === "new"}
                    onChange={() => {
                      setSelectedAddressId("new");
                      setForm((prev) => ({ ...prev, fullName: "", line1: "", line2: "", city: "", state: "", pincode: "" }));
                    }}
                    className="mt-0"
                  />
                  <span className="text-sm font-medium">Use a different address</span>
                </label>
              </div>
            )}

            {/* Address form (shown if no saved address or "new" selected) */}
            {(savedAddresses.length === 0 || selectedAddressId === "new") && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Address Line 1 *</label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="House no., Street, Area"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Address Line 2</label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Landmark (optional)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Pincode *</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="6-digit pincode"
                  required
                />
              </div>
            </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="rounded-lg border p-6 h-fit sticky top-28">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="mt-4 divide-y">
            {cart.items.map((item) => (
              <div key={`${item.productId}-${item.variantId || ""}`} className="flex gap-3 py-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                  {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  {item.options && (
                    <p className="text-xs text-muted-foreground">{Object.values(item.options).join(" / ")}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatINR(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(cart.totals.subtotal)}</span>
            </div>
            {cart.totals.discountTotal > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatINR(cart.totals.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{cart.totals.shippingTotal === 0 ? "Free" : formatINR(cart.totals.shippingTotal)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Total</span>
              <span>{formatINR(cart.totals.grandTotal)}</span>
            </div>
          </div>

          {/* Place Order button */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPending || !isFormValid}
            className="mt-6 w-full rounded-lg bg-primary py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Processing..." : `Pay ${formatINR(cart.totals.grandTotal)}`}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure payment powered by Cashfree Payments
          </p>
        </div>
      </div>
    </>
  );
}

export { CheckoutClient };
