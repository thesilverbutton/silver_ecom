# Rules — UI

> How every screen must look and behave. Pairs with `03-design-system.md`.

## 1. Tokens Only
- No hardcoded colors, font sizes, radii, or shadows in feature code. Use Tailwind classes bound to tokens.
- Spacing from the scale; no arbitrary `px` values except deliberate one-offs (documented).
- Two font families max (serif display + sans body), loaded via `next/font`.

## 2. Mobile-First
- Design and build at 375px first, then scale up (`sm md lg xl`). The site must be flawless on phones.
- Touch targets ≥ 44×44px. No hover-only interactions; provide tap/focus equivalents.
- Test from 320px width up with no horizontal scroll.

## 3. Component Discipline
- Compose pages from `components/*`; pages hold layout only, not styling primitives.
- Extend shadcn primitives via `cva` variants/props — do not fork per feature.
- Every interactive component: typed props, `cn()`, keyboard support, visible focus ring.

## 4. State Coverage
Every async or interactive surface must handle: **default, hover, focus-visible, active, disabled, loading (skeleton), error, empty.** No dead-ends — empty and error states always have a next action.

## 5. Feedback & Motion
- Use toasts (sonner) for action results; surface `traceId` on errors.
- Optimistic UI only for safe, reversible toggles (e.g., wishlist). Financial/destructive actions require explicit confirmation.
- Motion: 150–400ms, `ease-out` in / `ease-in` out. Honor `prefers-reduced-motion`.
- Never block the UI on network without a skeleton/spinner and a timeout fallback.

## 6. Forms
- `react-hook-form` + Zod resolver. Inline, specific error messages tied to fields (`aria-describedby`).
- Label every input (visible `<label>`, not placeholder-as-label). Show required state.
- Disable submit while pending; prevent double-submit; preserve entered values on error.
- Address/pincode/phone validated to Indian formats.

## 7. Imagery
- Product media via `next/image` + Cloudinary only; correct `sizes`, blur placeholder, explicit dimensions (no CLS). LCP image `priority`.
- Meaningful `alt` on product images (required in admin). Decorative images `alt=""`.
- Primary product aspect 1:1 in grids; PDP may use 4:5. Consistent aspect ratios prevent layout shift.

## 8. Navigation & IA
- Persistent Navbar (logo, nav, search, cart count, account) + MobileNav.
- Breadcrumbs on category/PDP. Cart count reflects live cart. Active states on nav.
- Search reachable in one tap from any storefront page.

## 9. Commerce UI Musts
- Prices always formatted `₹` via `formatINR`; show compare-at strikethrough when present.
- Out-of-stock clearly indicated; add-to-cart disabled with reason.
- Cart/checkout always show a clear totals breakdown (subtotal, discount, shipping, tax, grand total).
- Jewelry PDP shows: BIS/hallmark badge, material/purity/weight, certification, care, ring size guide, shipping promise, return policy.

## 10. Consistency & Polish
- One primary action per view (visually dominant). Secondary actions subdued.
- Consistent iconography (`lucide-react`, 1.5px stroke).
- Loading skeletons match final layout to avoid shift.
- Copy: concise, warm, plain. No jargon in customer-facing text.

## 11. Admin UI
- Desktop-first but tablet-usable. Server-paginated tables; never load full collections.
- Confirm dialogs (with reason field) for destructive/financial actions.
- Show validation errors inline; warn on unsaved changes.
