# 05 — API Specification

> Contracts for route handlers (`/api/*`) and the input/output shape of server actions. All bodies are JSON. All inputs validated with Zod before use. All money in **paise**.

## 1. Conventions

- **Base URL:** `NEXT_PUBLIC_APP_URL`.
- **Auth:** session cookie (Auth.js). Admin routes require `role in {admin, staff}`; account routes require a customer session.
- **Content type:** `application/json` unless noted (webhooks read raw body).
- **Prefer server actions** for UI-driven mutations (cart, checkout init, admin CRUD). Use **route handlers** for: webhooks, third-party callbacks, public JSON (search, sitemap), and anything called by non-React clients.

### 1.1 Standard response envelope
```jsonc
// success
{ "ok": true, "data": { /* ... */ } }
// error
{ "ok": false, "error": { "code": "OUT_OF_STOCK", "message": "Item is out of stock", "traceId": "..." } }
```

### 1.2 Status codes
`200` ok · `201` created · `400` validation · `401` unauthenticated · `403` forbidden · `404` not found · `409` conflict (stock/coupon) · `402` payment required/failed · `429` rate limited · `500` internal · `502` upstream (Razorpay/Shiprocket) failure.

### 1.3 Pagination
Query: `?page=1&limit=24&sort=newest`. Response `data`: `{ items, page, limit, total, totalPages }`. Max `limit` 60.

### 1.4 Errors
Map `AppError` subclasses to codes: `VALIDATION`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `OUT_OF_STOCK`, `COUPON_INVALID`, `PAYMENT_FAILED`, `SIGNATURE_INVALID`, `RATE_LIMITED`, `UPSTREAM`, `INTERNAL`.

---

## 2. Public — Catalog

### GET `/api/products` (or RSC service)
List/filter products.
- Query: `category`, `collection`, `q`, `minPrice`, `maxPrice`, `inStock`, `tags`, `sort` (`newest|price_asc|price_desc|popular`), `page`, `limit`.
- Returns paginated active products (public fields only; no cost/internal notes).

### GET `/api/products/:slug`
Single active product with variants, images, aggregated rating. `404` if draft/archived/missing.

### GET `/api/products/:slug/related`
Up to 8 related (same category, excluding self).

### GET `/api/categories`
Active categories/collections tree (ordered by `position`).

### GET `/api/search?q=`
Live search suggestions. Debounced client call. Rate-limited. Returns up to 8 `{ title, slug, image, price }`. Uses text index / Atlas Search.

### GET `/api/reviews?productId=`
Approved reviews for a product, paginated.

### POST `/api/reviews`
Create a review (customer or verified guest by order). Body: `{ productId, orderId?, rating, title?, body, images? }`. Stored `status:'pending'`. Rate-limited.

---

## 3. Cart (server actions preferred)

Cart identified by session (customer) or `cartId` cookie (guest). All totals recomputed server-side from current product prices — client-sent prices are ignored.

| Action | Input | Behavior |
| --- | --- | --- |
| `getCart()` | — | Returns cart with recomputed totals + validity flags (removed/out-of-stock lines). |
| `addToCart()` | `{ productId, variantId?, quantity }` | Validates stock; upserts line; returns cart. |
| `updateCartItem()` | `{ lineId, quantity }` | `quantity=0` removes; clamps to available stock. |
| `removeCartItem()` | `{ lineId }` | Removes line. |
| `applyCoupon()` | `{ code }` | Validates coupon vs cart; returns discount or `COUPON_INVALID`. |
| `removeCoupon()` | — | Clears coupon. |
| `estimateShipping()` | `{ pincode }` | Returns shipping estimate (flat/free-threshold; optional Shiprocket serviceability). |
| `mergeGuestCart()` | — | On login, merge guest cart into customer cart. |

---

## 4. Checkout & Payments

### POST `/api/checkout` (or `createCheckout` action)
1. Revalidate cart server-side (prices, stock, coupon).
2. Create an `Order` with `status:'pending'`, computed `grandTotal`.
3. Create a Razorpay Order (`amount = grandTotal`, `currency: 'INR'`, `receipt: orderNumber`).
4. Create a `Payment` record (`status:'created'`).
5. Return `{ razorpayOrderId, amount, currency, keyId, orderNumber }` to open Razorpay Checkout.

> Stock is **reserved-check only** here, not decremented. Decrement happens on the paid webhook.

### POST `/api/payments/verify` (client callback after Razorpay handler)
- Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
- Verify signature (`HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)`).
- On success: mark `Payment.status` provisionally; **do not** finalize the order here — show a "confirming payment" state and let the webhook finalize. Return `{ ok: true }`.
- On signature mismatch: `402 SIGNATURE_INVALID`; log.

### POST `/api/webhooks/razorpay`  ← source of truth
- Read **raw body**; verify `X-Razorpay-Signature` with `RAZORPAY_WEBHOOK_SECRET`. Invalid → `400 SIGNATURE_INVALID`, log, no state change.
- Idempotent: dedupe by event id; ignore already-processed events.
- On `payment.captured` / `order.paid`:
  1. Load `Payment` by `razorpayOrderId`; attach `paymentId`, `signature`, method.
  2. In a transaction: set `Order.status='paid'`, `paymentStatus='paid'`; **atomically decrement inventory** per line (guard against oversell → if any line short, flag order `needs_review`, do not oversell).
  3. Generate invoice, enqueue confirmation email (Resend), append `timeline` event.
  4. Create Shiprocket order (async, retry-safe) — see §5.
- On `payment.failed`: mark `Payment.failed`, keep `Order.pending`, notify nothing.
- Always return `200` quickly after verification + persistence; do slow work defensively (retries) without blocking the ack beyond provider timeout.

### POST `/api/webhooks/razorpay` refund events
`refund.processed` → update `Payment.refunds`, set `Order.paymentStatus` to `refunded`/`partially_refunded`, timeline event.

---

## 5. Shipping (Shiprocket)

Server-only; token cached (Shiprocket auth token ~10-day validity) in a DB doc, refreshed on 401.

| Action / Route | Purpose |
| --- | --- |
| `createShipment(orderId)` | Create Shiprocket order after payment; store `shiprocketOrderId`. |
| `generateAWB(orderId)` | Assign courier + AWB; store `awbCode`, `courierName`. |
| `getTracking(awb)` | Fetch live tracking; also updated by webhook. |
| `getLabel(orderId)` | Return label/invoice PDF URL. |
| POST `/api/webhooks/shiprocket` | Status sync → update `Order.fulfillmentStatus`, `trackingUrl`, timeline. |

Failures are retried with backoff; never block the storefront on Shiprocket.

---

## 6. Account (customer session required)

| Route / Action | Purpose |
| --- | --- |
| GET `/api/account/orders` | Paginated order history for the session customer. |
| GET `/api/account/orders/:orderNumber` | Order detail (ownership enforced). |
| POST `cancelOrder()` | Cancel if `status in {pending,paid,processing}` and within policy; initiates refund if paid. |
| CRUD `addresses` | Manage saved addresses. |
| `toggleWishlist()` | Add/remove product from wishlist. |

---

## 7. Admin (role admin/staff)

All admin mutations validate permissions and write an `AuditLog` entry.

| Area | Routes / actions |
| --- | --- |
| Products | list/create/update/archive; image upload sign; variant management |
| Categories | list/create/update/reorder/deactivate |
| Orders | list/filter; update fulfillment status; add tracking; initiate refund; resend email; download invoice |
| Customers | list/search; view detail + order history; block/unblock |
| Reviews | list/moderate (approve/reject) |
| Coupons | CRUD; toggle active |
| Settings | read/update store settings |
| Dashboard | KPIs: revenue, orders, AOV, low-stock, recent orders |
| Audit Logs | read/filter |

### POST `/api/admin/uploads/sign`
Returns a signed Cloudinary upload payload (folder `products/`, allowed formats, size cap). Client uploads directly to Cloudinary; server stores returned `{ url, publicId, width, height }`.

---

## 8. System

- GET `/api/health` — `{ ok: true, db: 'up' }` for uptime checks.
- GET `/sitemap.xml`, `/robots.txt` — see `09-seo-performance.md`.

## 9. Cross-cutting Rules

- **Idempotency:** webhooks and payment finalization must be idempotent (dedupe by provider event/payment id).
- **Never trust client money:** recompute subtotal, discount, shipping, tax, and grandTotal server-side on every checkout.
- **Rate limiting:** search, review submit, login/register, checkout init, coupon apply (MongoDB TTL counter).
- **Validation:** reject unknown fields; coerce and bound numbers; sanitize rich text before storage/render.
