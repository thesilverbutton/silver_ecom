# 08 — Admin Dashboard

> The store owner's control center at `/admin/*`. Role-gated (`admin`/`staff`), server-authorized, every mutation audited. Built for a non-technical owner: clear, fast, forgiving.

## 1. Access & Layout

- Protected by middleware + server-side role checks (see `06-authentication.md`).
- Layout: left sidebar nav, top bar (search, admin name, sign-out), content area with page header + primary action.
- Fully responsive but **desktop-first** for admin (owner will manage from a laptop; must still be usable on tablet).
- Every list view: search, filters, sort, pagination, empty state, loading skeletons, row actions.

## 2. Modules

### 2.1 Dashboard (`/admin`)
KPI cards + recent activity. Data server-computed, cached briefly.
- Revenue (today / 7d / 30d), Orders count, Average Order Value.
- Pending/processing orders needing action.
- Low-stock products (below threshold).
- Recent orders table (last 10) with status.
- Simple revenue trend chart (recharts).

### 2.2 Products (`/admin/products`)
- List: image, title, category, price, stock, status; filter by category/status/stock; search by title/SKU.
- Create/Edit form (react-hook-form + Zod):
  - Title, slug (auto, editable pre-publish), description (rich text), category, collections, tags.
  - Pricing: base price, compare-at.
  - Images: direct Cloudinary upload (signed), reorder, set primary, alt text.
  - Variants: add size/finish rows with SKU, price delta, stock.
  - Jewelry attributes: material, purity, weight, dimensions, stone, BIS hallmark toggle, certification, care instructions.
  - Flags: featured, best-seller; status draft/active/archived.
  - SEO: title, description, OG image.
- Actions: publish/unpublish, archive (soft), duplicate. Archived products keep order history intact.

### 2.3 Categories & Collections (`/admin/categories`)
- CRUD, drag-to-reorder (`position`), activate/deactivate, image, SEO.
- Prevent deleting a category with products (block or reassign).

### 2.4 Orders (`/admin/orders`)
- List: order number, date, customer, total, payment status, fulfillment status; filter by status/date range/payment; search by order number/email/phone.
- Detail view:
  - Items (with snapshot prices), totals breakdown, coupon.
  - Customer + shipping/billing address.
  - Payment info (Razorpay ids, method, refunds) — read-only.
  - Timeline of events.
- Actions:
  - Update fulfillment status (processing → shipped → delivered).
  - Create Shiprocket shipment / generate AWB / view label / tracking (see `05` §5).
  - Initiate refund (full/partial) via Razorpay → updates Payment + Order, restocks if configured.
  - Resend confirmation email; download invoice; add internal note.
- **Guardrails:** cannot manually mark unpaid order as paid outside webhook; refunds require confirmation + reason; all actions audited.

### 2.5 Customers (`/admin/customers`)
- List/search by name/email/phone; view detail: profile, addresses, order history, lifetime value.
- Block/unblock (blocks login + checkout).
- No password visibility ever; can trigger a password-reset email.

### 2.6 Reviews (`/admin/reviews`)
- Moderation queue (pending/approved/rejected); approve/reject; reply optional.
- Approving recomputes product `ratingAverage`/`ratingCount`.

### 2.7 Coupons (`/admin/coupons`)
- CRUD: code, type (percentage/fixed/free_shipping), value, min subtotal, max discount, usage limits, per-customer limit, scope, schedule, active toggle.
- Show usage count and remaining.

### 2.8 Settings (`/admin/settings`)
- Store profile (name, support email/phone, socials).
- Commerce: currency (INR fixed), GST enabled/percent + inclusive/exclusive model, free-shipping threshold, flat shipping rate, COD toggle, return window, origin pincode.
- Content: announcement bar, policy texts (shipping/returns/privacy/terms).
- Writes update the Settings singleton, bust caches, and log to AuditLog.

### 2.9 Audit Logs (`/admin/audit-logs`)
- Read-only, filterable by actor/action/entity/date. Shows before/after diffs (redacted). For accountability and debugging.

## 3. Permissions Matrix (staff via `permissions[]`; admin = all)

| Capability | admin | staff (if granted) |
| --- | --- | --- |
| View dashboard | ✓ | ✓ |
| Products CRUD | ✓ | `products:write` |
| Orders view | ✓ | `orders:read` |
| Orders fulfill/ship | ✓ | `orders:write` |
| Refunds | ✓ | rarely; `orders:refund` |
| Customers block | ✓ | `customers:write` |
| Coupons | ✓ | `coupons:write` |
| Settings | ✓ | — |
| Audit logs | ✓ | — |
| Manage staff/permissions | ✓ | — |

Enforce in the **service layer**, not just UI. Hide UI the user can't use, but never rely on hiding for security.

## 4. UX Requirements

- Optimistic UI only for safe toggles; destructive/financial actions require explicit confirm dialogs with typed/checkbox confirmation and a reason field where relevant.
- Autosave drafts for the product form or warn on unsaved navigation.
- Bulk actions where useful (bulk archive products, bulk status on orders) — with confirmation.
- Clear success/error toasts (sonner) surfacing the `traceId` on error.
- All data tables server-paginated; never load entire collections client-side.

## 5. Acceptance Criteria

- [ ] Owner can add a fully-live product (with images + variants) in under 3 minutes.
- [ ] Orders can move through the full fulfillment lifecycle with Shiprocket AWB + tracking.
- [ ] Refunds update payment, order, and (optionally) inventory, and are audited.
- [ ] Reviews moderation recomputes product ratings.
- [ ] Every admin mutation writes an AuditLog entry with actor + diff.
- [ ] Staff permissions are enforced server-side; a staff member without a permission cannot perform the action even via direct API call.
- [ ] No admin action can mark an order paid outside the webhook.
