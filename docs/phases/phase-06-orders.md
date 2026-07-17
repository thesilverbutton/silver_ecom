# Phase 06 — Orders & Shipping

> Maps roadmap Phase 9 (Orders) and Phase 10 (Shipping/Shiprocket). **Goal: customers track orders; the store fulfills and ships them.**

## Objective
Build customer order history/detail/tracking/cancellation and integrate Shiprocket for shipment creation, AWB, labels, tracking, and status sync. Admin order actions are wired here and surfaced in the admin UI in Phase 07.

## Scope
- Customer: order history, detail, tracking, cancellation (policy-gated).
- `order.service` lifecycle transitions + `shipping.service` (Shiprocket).
- Shiprocket: create shipment, generate AWB, label, tracking, webhook status sync.
- Refund initiation hook (Razorpay) used by admin.

## Tasks
1. **order.service**: `getForCustomer`, `getByNumber` (ownership enforced), `cancel` (allowed states + within policy; triggers refund + restock if paid), status transition helpers with timeline events.
2. **Account pages**: `/account/orders` (paginated history), `/account/orders/[orderNumber]` (items, totals, address, timeline, tracking link, cancel button when eligible).
3. **shipping.service**: Shiprocket auth token cache + refresh on 401; `createShipment`, `generateAWB`, `getLabel`, `getTracking`.
4. **Shipment creation**: triggered post-payment (from Phase 05 webhook) and/or admin action; store `shiprocketOrderId`, `awbCode`, `courierName`, `trackingUrl`.
5. **/api/webhooks/shiprocket**: verify + update `fulfillmentStatus`, tracking, timeline.
6. **Refunds**: `payment.service.refund` (full/partial) via Razorpay; updates Payment/Order; restock if configured; audited (used by admin UI in Phase 07).
7. **Emails**: shipment (with tracking), delivered, cancellation/refund via Resend.

## Acceptance Criteria
- [ ] Customer sees only their own orders; guest orders accessible via order number + email lookup.
- [ ] Order detail shows items, totals, address, timeline, and live tracking when shipped.
- [ ] Cancellation allowed only in permitted states/within policy; paid cancellation initiates refund + restock.
- [ ] Shiprocket shipment + AWB generation works; label retrievable; tracking URL stored.
- [ ] Shiprocket webhook updates fulfillment status and timeline.
- [ ] Shiprocket failures never break storefront/checkout; retried with backoff.
- [ ] Refund updates payment + order and restocks (if configured), with audit + email.
- [ ] `typecheck && lint && build` pass.

## Testing Checklist
- Ownership enforcement on order detail (cannot read others' orders).
- Cancellation state matrix (allowed vs blocked).
- Shiprocket token refresh on 401.
- Refund partial/full updates amounts correctly (paise) and restocks.
- Status sync webhook updates order.

## Definition of Done
Orders are trackable by customers and fully fulfillable/shippable by the store, with refunds and status sync working.
