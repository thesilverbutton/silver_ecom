# Rules — Performance

> Target Lighthouse mobile > 95 and Core Web Vitals within budget. Pairs with `09-seo-performance.md`.

## 1. Budgets (mobile, 4G)
| Metric | Budget |
| --- | --- |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | < 0.6s |
| Initial route JS | < 150KB gzip |

Treat budget regressions as bugs.

## 2. Rendering
- **Server Components by default.** Ship interactivity, not whole pages, to the client.
- Static/ISR for home, PDP, category, collections, policies with `revalidate` + tag-based invalidation on admin edits.
- `force-dynamic` limited to cart, checkout, account, admin.
- Stream with Suspense + skeletons; never block the whole page on one slow query.

## 3. Images
- `next/image` only for product media (no raw `<img>`). Correct `sizes` per layout.
- Cloudinary `f_auto,q_auto` + responsive widths (AVIF/WebP). LQIP blur placeholder.
- Explicit width/height (or aspect ratio) to eliminate CLS. LCP/hero image `priority`; everything else lazy.

## 4. JavaScript
- Dynamic-import heavy/below-fold client widgets (gallery zoom, charts, rich-text editor, Razorpay script) via `next/dynamic`.
- Named imports for `lucide-react` and similar (tree-shake). No wholesale `lodash`/`moment` — use `date-fns` + native.
- Keep client components leaf-level and minimal; push state down.
- Run `@next/bundle-analyzer` before launch; investigate any chunk > ~50KB.

## 5. Fonts
- `next/font` self-hosted, `display: swap`, preload, subset `latin`. Max two families. No FOIT/layout shift from fonts.

## 6. Data & Database
- `.lean()` + field projection on all storefront reads. Never over-fetch.
- Every hot query backed by an index (`04-database-schema.md`); verify with `explain()` (product list, search, order lookup, webhook payment lookup).
- Paginate everything; hard cap `limit` (≤ 60). No unbounded scans.
- Cache Settings + nav data; avoid per-request refetch of static-ish config.

## 7. Network & Third-Party
- Load Razorpay checkout script only on the checkout route, on demand.
- Defer/lazy analytics; no render-blocking third-party CSS/JS.
- Set proper `Cache-Control` on static assets (Vercel handles most); use immutable hashed assets.

## 8. Caching Discipline
- Use `revalidateTag` after product/category/settings mutations so storefront reflects changes without over-fetching.
- Don't cache per-user data (cart/account) at the CDN.

## 9. Perceived Performance
- Skeletons match final layout (no shift on load).
- Optimistic UI for safe toggles.
- Prefetch likely-next routes (Next.js `<Link>` default) for category → PDP.

## 10. Monitoring
- `useReportWebVitals` → analytics; watch field CWV post-launch.
- Lighthouse CI on key routes in the pipeline.
- Alert on TTFB/error-rate regressions.

## 11. Checklist (Phase 08)
- [ ] Lighthouse mobile > 95 (home, PDP, category).
- [ ] CWV within budget in the field.
- [ ] Bundle analyzed; no surprise large client chunks.
- [ ] All images optimized, no CLS, LCP prioritized.
- [ ] Hot DB queries indexed and verified with `explain()`.
- [ ] Third-party scripts deferred/on-demand.
