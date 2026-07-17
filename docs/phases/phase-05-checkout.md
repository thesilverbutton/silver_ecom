# Phase 05 — Checkout & Payments

> Maps roadmap Phase 8. **Goal: money-safe checkout. The webhook is the source of truth — not the browser.** Read `07-commerce-engine.md` §4–§5 in full before starting.

## Objective
Implement the full checkout flow: address collection, server-side revalidation + total computation, Razorpay order creation, payment, signature verification, and authoritative order finalization via the Razorpay webhook with atomic inventory decrement, invoice, and confirmation email.

## Scope
- Checkout page (guest + customer), address form.
- `createCheckout` (order + Razorpay order + payment record).
- Client Razorpay checkout integration + `/api/payments/verify`.
- `/api/webhooks/razorpay` (finalization, idempotent, signature-verified).
- Invoice generation + Resend confirmation email.
- Success/confirming/failure pages.

## Tasks
1. **Checkout page**: shipping address (saved addresses for customers; form for guests), email/phone, order summary, place-order CTA. Revalidate cart on load and on submit.
2. **createCheckout** (`actions`/`/api/checkout`): revalidate cart, compute totals server-side, create `Order` (pending, snapshot items), create Razorpay order, create `Payment` (created). Return checkout params.
3. **Client integration**: open Razorpay Checkout with returned params; on handler callback POST to `/api/payments/verify`.
4. **/api/payments/verify**: verify HMAC signature; provisional payment update; DO NOT finalize; return ok → route to "confirming" state.
5. **/api/webhooks/razorpay**: raw-body signature verify; idempotent dedupe; on `payment.captured`/`order.paid` → transaction: mark order/payment paid, **atomic inventory decrement**, commit coupon redemption, timeline event; post-commit: invoice + email + Shiprocket create (retry-safe). Handle `payment.failed`, `refund.processed`.
6. **Reconciliation**: Vercel cron sweeps `pending` orders with captured Razorpay payments (missed webhook) and finalizes; admin "re-check payment" action.
7. **Invoice**: generate PDF, store URL on order.
8. **Emails**: order confirmation via Resend after paid.
9. **Result pages**: `/checkout/success?order=`, confirming state (poll until paid), failure/retry.

## Acceptance Criteria
- [ ] Totals recomputed server-side at checkout; tampered client amounts are ignored.
- [ ] Order created as `pending`; flips to `paid` **only** via signature-verified webhook.
- [ ] Signature verification enforced on both `/verify` and webhook; invalid signatures rejected + logged, no state change.
- [ ] Inventory decrements atomically on paid webhook; concurrent last-unit purchase cannot oversell (loser flagged `needs_review`).
- [ ] Webhook + finalization are idempotent (duplicate events cause no double decrement/email).
- [ ] Guest and logged-in checkout both work.
- [ ] Confirmation email + invoice generated after payment.
- [ ] Missed-webhook reconciliation finalizes the order.
- [ ] Success page reflects paid status; failure path lets the user retry.
- [ ] `typecheck && lint && build` pass.

## Testing Checklist (Razorpay test mode)
- Successful payment → order paid, stock decremented once, email sent, invoice created.
- Tampered amount rejected.
- Duplicate webhook → no double effects.
- Failed payment → order stays pending, no stock change.
- Refund event → payment/order updated.
- Concurrency test: two orders for last unit → exactly one succeeds.
- Missed webhook simulated → reconciliation finalizes.

## Definition of Done
A customer can pay and receive a confirmed order + email/invoice, with inventory and money provably correct and webhook-authoritative.
