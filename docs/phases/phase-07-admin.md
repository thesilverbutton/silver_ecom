# Phase 07 — Admin Dashboard

> Maps roadmap Phase 11. **Goal: the owner runs the entire store without a developer.** Read `08-admin-dashboard.md` in full.

## Objective
Build the admin UI over the services created in earlier phases: dashboard KPIs, products, categories, orders, customers, reviews, coupons, settings, and audit logs. Role-gated, server-authorized, fully audited.

## Scope
All admin modules per `08-admin-dashboard.md`, with permissions enforced in services and AuditLog written on every mutation.

## Tasks
1. **Admin shell**: layout (sidebar, topbar), `/admin/login`, `requireAdmin(perm)` guard, responsive.
2. **Dashboard**: revenue (today/7d/30d), orders, AOV, low-stock, pending-action orders, recent orders, revenue trend chart.
3. **Products**: DataTable list (search/filter/sort/paginate), create/edit form (all fields incl. variants, jewelry attributes, SEO), signed image upload + reorder, publish/unpublish/archive/duplicate.
4. **Categories/Collections**: CRUD, drag-reorder, activate/deactivate, guard against deleting non-empty categories.
5. **Orders**: list + filters; detail with items/totals/address/payment/timeline; fulfillment status updates; Shiprocket create/AWB/label/tracking; refund (confirm + reason); resend email; download invoice; internal notes.
6. **Customers**: list/search, detail with order history + LTV, block/unblock, trigger password reset.
7. **Reviews**: moderation queue, approve/reject (recompute product rating).
8. **Coupons**: CRUD, usage display, active toggle.
9. **Settings**: edit store/commerce/content settings; cache-bust on save.
10. **Audit logs**: read-only filterable view with before/after diffs.
11. **AuditLog writes**: every mutating action records actor + diff + traceId.

## Acceptance Criteria
- [ ] Owner can add a fully-live product (images + variants) in under 3 minutes.
- [ ] Orders move through full lifecycle with Shiprocket AWB + tracking; refunds work and are audited.
- [ ] Reviews moderation recomputes product ratings.
- [ ] Coupons CRUD with enforced limits; usage visible.
- [ ] Settings changes take effect on the storefront (cache invalidation).
- [ ] Staff permissions enforced **server-side**: a staff user lacking a permission cannot perform the action even via direct API call.
- [ ] No admin action can mark an order paid outside the webhook.
- [ ] Every mutation writes an AuditLog entry.
- [ ] All tables server-paginated; destructive/financial actions require confirmation + reason.
- [ ] `typecheck && lint && build` pass.

## Testing Checklist
- Authorization: staff without permission blocked at service layer (not just hidden UI).
- Product create/edit validation (Zod) incl. variant SKU uniqueness.
- Refund flow updates payment/order/inventory + audit.
- Settings save busts storefront cache (revalidateTag).
- Audit diffs redact sensitive fields.

## Definition of Done
A non-technical owner can fully operate catalog, orders, customers, coupons, and settings, with complete audit accountability.
