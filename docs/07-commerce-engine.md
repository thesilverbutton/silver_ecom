# 07 — Commerce Engine

> The money- and stock-critical core: cart, pricing, coupons, checkout, payment finalization, and inventory. This logic lives in `src/services` and is never duplicated in components. Read `04-database-schema.md` and `05-api-specification.md` alongside this.

## 0. Iron Rules

1. **The browser is not the source of truth. The Razorpay webhook is.**
2. **Recompute all money server-side** on every checkout from live product prices. Never trust client-sent prices, discounts, or totals.
3. **Decrement inventory only on the verified paid webhook**, atomically, never on checkout init.
4. **All money is integer paise.** Round only at the final total, using consistent rounding (round half up).
5. **Everything is idempotent** where a retry is possible (payment finalization, webhooks, shipment creation).

---

## 1. Cart

### Identity
- Customer: cart keyed by `customerId`.
- Guest: cart keyed by opaque `cartId` cookie (HTTP-only, 30-day). TTL index cleans abandoned guest carts.

### Model (ephemeral collection, replaces Redis)
```ts
interface Cart {
  _id: ObjectId;
  cartId?: string;              // guest cookie key
  customerId?: ObjectId;
  items: CartItem[];
  couponCode?: string;
  updatedAt: Date;              // TTL index (e.g., 30 days)
}
interface CartItem { productId: ObjectId; variantId?: ObjectId; quantity: number; addedAt: Date; }
```
Only stable references + quantity are stored. **Price is never stored in the cart** — it is resolved live so cart always reflects current price and stock.

### Operations (see actions in `05`)
- `addToCart`: validate product active + stock ≥ requested; merge same line; clamp to available.
- `updateCartItem`: clamp to stock; `0` removes.
- `removeCartItem`, `clearCart`.
- `getCart`: resolve each line against current Product/Variant → attach `unitPrice`, `available`, `title`, `image`, and per-line flags: `PRICE_CHANGED`, `OUT_OF_STOCK`, `QTY_REDUCED`, `REMOVED`. Return a `valid` boolean the checkout gate uses.
- `mergeGuestCart(customerId)`: union guest + customer items (sum quantities, clamp to stock), delete guest cart, clear cookie.

## 2. Pricing Pipeline

Compute in this exact order (all paise):
```
lineTotal      = unitPrice(base + variant.priceDelta) * quantity
subtotal       = Σ lineTotal
discountTotal  = couponDiscount(subtotal, coupon)        // capped, floored at 0
taxableBase    = subtotal - discountTotal
taxTotal       = gstEnabled ? round(taxableBase * gstPercent/100) : 0   // if prices are tax-exclusive
shippingTotal  = shippingRate(taxableBase, address)      // 0 if free-shipping coupon or threshold met
grandTotal     = taxableBase + taxTotal + shippingTotal
```
> Default assumption: displayed prices are **tax-inclusive** (common for Indian D2C), so `taxTotal=0` and GST is shown as "inclusive". If `Settings.gstEnabled` treats prices as exclusive, apply the formula above. Record the chosen model in `Settings` and keep it consistent across cart, checkout, invoice.

### Shipping
- `shippingTotal = 0` if `subtotal - discount >= Settings.freeShippingThreshold` (when set) or a `free_shipping` coupon applies; else `Settings.flatShippingRate`.
- Optional: call Shiprocket serviceability by destination pincode for a real estimate; fall back to flat rate on failure.

## 3. Coupons

Validation checks (all must pass) at apply-time **and** re-checked at checkout:
- `isActive`, within `startsAt`/`expiresAt`.
- `subtotal >= minSubtotal`.
- `usageCount < usageLimit` (global) and per-customer usage `< perCustomerLimit`.
- `appliesTo` scope matches at least one eligible line (discount applies only to eligible subtotal if scoped).

Discount computation:
- `percentage`: `min(round(base * value/100), maxDiscount ?? ∞)`.
- `fixed`: `min(value, base)`.
- `free_shipping`: sets `shippingTotal = 0`.

Redemption is committed **atomically on order paid** (increment `usageCount` with a conditional update; if it would exceed `usageLimit`, fail the coupon and recompute without it — never oversell a coupon).

## 4. Checkout Flow (detailed)

```
1. Customer clicks Checkout
2. Server revalidates cart:
     - all lines active, in stock, prices current, coupon still valid
     - if invalid → return updated cart + reasons; block payment
3. Collect/confirm shipping address + email (+ phone)
4. Compute totals server-side (Pricing Pipeline)
5. Create Order (status=pending, paymentStatus=unpaid) with price SNAPSHOT in items
6. Create Razorpay Order (amount=grandTotal, currency=INR, receipt=orderNumber, notes={orderId})
7. Create Payment (status=created, razorpayOrderId)
8. Return {razorpayOrderId, amount, keyId, orderNumber} → open Razorpay Checkout (client)
9. Customer pays in Razorpay widget
10. Razorpay handler returns → POST /api/payments/verify (verify signature)
        → show "confirming your payment" (do NOT finalize here)
11. Razorpay → POST /api/webhooks/razorpay  ← FINALIZES ORDER (source of truth)
12. Success page reads order by orderNumber; polls/streams until paymentStatus=paid
```

### Why verify-endpoint does not finalize
The browser can close, lie, or be replayed. `/api/payments/verify` only gives fast UX feedback. The **webhook** is authoritative, idempotent, and signature-verified, and it is what flips the order to `paid` and decrements stock.

## 5. Payment Finalization (webhook) — canonical algorithm

```
on POST /api/webhooks/razorpay:
  raw = readRawBody()
  if !verifyHmac(raw, header, WEBHOOK_SECRET): return 400 SIGNATURE_INVALID  (log)
  event = parse(raw)
  if alreadyProcessed(event.id): return 200            // idempotent
  markEventReceived(event)

  switch event:
    case 'payment.captured' | 'order.paid':
      startTransaction:
        payment = Payment.findOne({razorpayOrderId})   // lock
        if payment.status == 'captured': commit; return 200   // idempotent
        order = Order.findById(payment.orderId)
        // atomic inventory decrement per line
        for line in order.items:
          res = decrementStock(line)                   // conditional $inc guarded by stock >= qty
          if !res.ok: shortfall.push(line)
        if shortfall.empty:
          order.status='paid'; order.paymentStatus='paid'
          commitCouponRedemption(order.couponCode)
        else:
          order.status='paid'; order.flags.push('needs_review:oversold')
          // never oversell: fulfill what's available, refund/notify difference (admin task)
        payment.status='captured'; attach paymentId, method, signature
        order.timeline.push({status:'paid'})
      commit
      // post-commit, retry-safe, non-blocking:
      generateInvoice(order); sendConfirmationEmail(order); createShiprocketOrder(order)
      revalidateProductPages(affected)
      return 200

    case 'payment.failed':
      payment.status='failed'; order stays pending; log; return 200

    case 'refund.processed':
      update Payment.refunds; set Order.paymentStatus refunded/partially_refunded; timeline; return 200
```

### Atomic inventory decrement
```ts
// variant
Product.updateOne(
  { _id, 'variants._id': variantId, 'variants.stock': { $gte: qty } },
  { $inc: { 'variants.$.stock': -qty } }
); // matchedCount===0 → insufficient stock
// simple product
Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
```
Use a session/transaction spanning order update + all decrements so a failure rolls back cleanly.

## 6. Inventory Rules

- Storefront shows `available = stock` (or variant stock). Show "Only N left" when low (< threshold).
- No reservation on add-to-cart or checkout init (keeps it simple; free-tier scale). Stock is only committed at paid webhook. If two orders race for the last unit, the atomic decrement guarantees only one succeeds; the other is flagged `needs_review` and refunded.
- Restock/adjustment via admin writes an AuditLog entry.
- On order cancellation/refund of a paid order, **restock** the items (atomic `$inc` back) unless admin marks them non-restockable.

## 7. Invoices

- Generate a GST-style invoice (order number, items, taxes, totals, seller + buyer details) as PDF; store URL on `Order.invoiceUrl` (Cloudinary or Vercel blob). Attach to confirmation email.

## 8. Emails (Resend)

Transactional templates: order confirmation (paid), shipment/AWB with tracking, delivered, cancellation/refund. All triggered server-side post-webhook or on admin action. Include order number, items, totals, and support contact. Never include payment secrets.

## 9. Edge Cases (must handle)

- Price changed between add-to-cart and checkout → show new price, require re-confirm.
- Item goes out of stock at checkout → block line, let user remove/adjust.
- Payment success but webhook delayed → success page shows "confirming"; reconcile via a scheduled/`on-demand` check against Razorpay if webhook not seen within N minutes.
- Duplicate webhook / verify calls → idempotent, no double decrement, no double email.
- Partial oversell on race → fulfill available, refund difference, flag for admin.
- Coupon exhausted between apply and pay → recompute without coupon, inform user before charging (re-confirm total).
- Guest checkout then account creation → link orders by verified email.

## 10. Acceptance Criteria

- [ ] Totals always recomputed server-side; tampered client prices are ignored.
- [ ] Order flips to `paid` only via signature-verified webhook.
- [ ] Inventory decrements atomically; concurrent last-unit purchases cannot oversell.
- [ ] Webhook and payment finalization are idempotent (no double stock/email).
- [ ] Coupons enforce all limits atomically; cannot over-redeem.
- [ ] Cancellation/refund of paid orders restocks inventory.
- [ ] Confirmation email + invoice generated after paid webhook.
