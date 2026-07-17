# Phase 03 — Product Module & Storefront

> Maps roadmap Phase 5 (Product Engine), Phase 6 (Storefront pages), Phase 12 (Jewelry-specific features). **Goal: a fully browsable catalog.**

## Objective
Build the product/category services and the public storefront: home, shop listing with filters/sort/pagination, product detail with gallery and jewelry features, search, related + recently viewed, and wishlist. Backend services power admin later.

## Scope
- Product & Category services (read + write used by admin in Phase 07).
- Signed Cloudinary image upload flow.
- Search (text index / Atlas Search), filters, sorting, pagination.
- Storefront pages: Home, Shop, Collections, Product detail, About, Contact, Policies.
- Jewelry UX: image zoom, fullscreen gallery, pinch-zoom, BIS/hallmark badge, certification, material details, ring size guide, care instructions, shipping/return blocks.
- Wishlist (customer DB + guest localStorage) and recently viewed.

## Tasks
1. **Services**: `product.service` (list/filter/get/related, CRUD used later), `category.service`. `.lean()` + projections for reads.
2. **Search**: `/api/search` with text index; debounced client suggestions; rate-limited.
3. **Shop page**: server reads `searchParams` → filters (category, price, availability, tags), sort, pagination; SEO metadata; skeletons.
4. **Collections**: `/collections/[slug]` curated listing.
5. **Product detail** `/products/[slug]`: gallery (zoom/fullscreen/pinch), variant selector with availability, price/compare-at, add-to-cart CTA (wires to Phase 04), jewelry blocks (material, purity, weight, BIS badge, certification, care), ring size guide modal, shipping promise, return policy, related products, approved reviews, recently-viewed rail. Product JSON-LD + metadata.
6. **Home**: hero, featured/best-sellers, category highlights, brand story teaser.
7. **Static pages**: About, Contact (enquiry form → email via Resend, rate-limited, spam-guarded), Policies (from Settings).
8. **Wishlist**: toggle action for customers; localStorage for guests; merge on login.
9. **Recently viewed**: client-side (localStorage) rail on PDP/home.
10. **Images**: `/api/admin/uploads/sign` + `next/image` + Cloudinary transforms.

## Acceptance Criteria
- [ ] Shop lists active products with working category/price/availability filters, sort, and server pagination.
- [ ] Search returns relevant live suggestions and is rate-limited.
- [ ] PDP shows gallery with zoom + fullscreen + mobile pinch/swipe, variants with correct availability, and all jewelry blocks.
- [ ] Related products and recently viewed render; wishlist toggles and persists (customer + guest merge).
- [ ] Draft/archived products 404 on storefront.
- [ ] Product/category pages emit valid metadata + Product/Breadcrumb JSON-LD.
- [ ] Images optimized (next/image, Cloudinary, blur placeholder, no CLS).
- [ ] `typecheck && lint && build` pass; Lighthouse mobile > 90 on PDP (final tuning in Phase 08).

## Testing Checklist
- Filter/sort/pagination correctness (unit tests on service query builder).
- Search index returns expected matches; empty-state shown for no results.
- Variant availability logic (out-of-stock disables option).
- Wishlist merge on login.

## Definition of Done
A shopper can discover and inspect products end to end; add-to-cart hooks are ready for Phase 04.
