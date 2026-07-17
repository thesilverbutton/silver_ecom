# Phase 04 — Cart

> Maps roadmap Phase 7. **Goal: a reliable cart that always reflects live price and stock.**

## Objective
Implement the cart service and UI: add/remove/update, guest and persistent customer carts, coupon application, and shipping estimate. Prices and totals are always recomputed server-side; the cart stores only references + quantities.

## Scope
- Cart model (ephemeral, TTL) + `cart.service` per `07-commerce-engine.md`.
- Guest cart (cookie) and customer cart (DB); merge on login.
- Cart drawer + full cart page.
- Coupon apply/remove with server validation.
- Shipping estimate (flat/free-threshold, optional Shiprocket serviceability).

## Tasks
1. **cart.service**: `getCart` (resolves live prices/stock + per-line flags), `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`, `applyCoupon`, `removeCoupon`, `estimateShipping`, `mergeGuestCart`.
2. **Server actions** wrapping the service (`actions/cart.ts`) with Zod validation.
3. **Identity**: guest `cartId` cookie (HTTP-only, 30-day); customer cart by session; merge + cookie-clear on login.
4. **Pricing**: implement the pricing pipeline (subtotal → discount → tax → shipping → grand total) in a shared helper reused by checkout.
5. **UI**: CartDrawer (from Navbar) + `/cart` page — line items with QuantityStepper, remove, coupon input, totals, shipping estimate, checkout CTA. Empty state.
6. **Validity surfacing**: show PRICE_CHANGED / OUT_OF_STOCK / QTY_REDUCED / REMOVED per line; block checkout until resolved.
7. **Coupons**: apply validates active/schedule/min-subtotal/limits/scope; clear error messaging.

## Acceptance Criteria
- [ ] Add/update/remove works from PDP and drawer; quantities clamp to available stock.
- [ ] Cart totals are computed server-side; editing client values cannot change price.
- [ ] Guest cart persists via cookie and survives reloads; merges into customer cart on login (quantities summed, clamped).
- [ ] Coupon applies with correct discount and is rejected with a clear reason when invalid.
- [ ] Shipping estimate reflects free-shipping threshold / flat rate.
- [ ] Out-of-stock or price-changed lines are flagged and block checkout until resolved.
- [ ] TTL cleans abandoned guest carts.
- [ ] `typecheck && lint && build` pass.

## Testing Checklist
- Pricing pipeline unit tests (discount caps, free-shipping threshold, rounding in paise).
- Coupon validation matrix (expired, below-min, over-limit, wrong scope).
- Guest→customer merge with overlapping items and stock clamp.
- Concurrency: two rapid adds don't duplicate lines.

## Definition of Done
Cart is correct, persistent, and coupon/shipping-aware, feeding a trustworthy total into checkout.
