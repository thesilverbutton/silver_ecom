# 09 — SEO & Performance

> Target: Lighthouse > 95 on mobile across Performance, Accessibility, Best Practices, SEO. Silver jewelry is discovery-driven, so organic search and fast, image-rich pages are revenue.

## 1. SEO

### 1.1 Metadata (App Router `generateMetadata`)
- Every route exports metadata. Product/category pages generate metadata from data.
- Title pattern: `"{Product} — Silver {Category} | The Silver Button"`; homepage brand-led.
- Unique meta description per page (fallback to `shortDescription`).
- `metadataBase` set to `NEXT_PUBLIC_APP_URL`.

### 1.2 Canonical URLs
- Self-referential canonical on every indexable page.
- Filtered/sorted shop URLs: canonical to the clean category URL; add `robots: noindex` to thin filter permutations.
- Slug changes issue a 301 redirect from the old slug (keep a redirects map).

### 1.3 Open Graph & Twitter
- OG: title, description, `og:image` (product primary image via Cloudinary, 1200×630), `og:type=product` on PDP, `product:price:amount/currency`.
- Twitter `summary_large_image`.

### 1.4 Structured Data (JSON-LD)
Inject via a `<script type="application/ld+json">` server component.
- **Organization** (site-wide): name, logo, contactPoint, sameAs (socials).
- **WebSite** + `SearchAction` (sitelinks search box).
- **Product** (PDP): name, image[], description, sku, brand, `AggregateRating` (if reviews), `Offer` with `priceCurrency: INR`, `price`, `availability`, `priceValidUntil`, shipping/return where applicable.
- **BreadcrumbList** on category/PDP.
- **Review**/`AggregateRating` from approved reviews.
- Validate against Google Rich Results Test before launch.

### 1.5 Sitemap & robots
- `app/sitemap.ts` — dynamic: home, static pages, active categories/collections, active products (with `lastModified`). Split if > 50k URLs (not expected).
- `app/robots.ts` — allow storefront; disallow `/admin`, `/account`, `/api`, `/checkout`, cart; reference sitemap.
- Submit sitemap to Google Search Console at launch.

### 1.6 URL structure
- Products: `/products/{slug}`. Categories: `/collections/{slug}` or `/shop?category=`. Keep clean, lowercase, hyphenated, stable.

### 1.7 Content SEO
- One `<h1>` per page; logical heading order.
- Descriptive, keyword-aware product titles/descriptions (client-provided; guide them).
- Alt text on all product images (required in admin form).
- Internal linking: related products, category cross-links, breadcrumbs.

## 2. Performance

### 2.1 Budgets (mobile, 4G)
| Metric | Budget |
| --- | --- |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | < 0.6s |
| JS shipped (route) | < 150KB gzip initial |
| Image weight (PDP) | lazy beyond first; primary optimized |

### 2.2 Rendering & caching
- RSC-first; minimal client components. Ship interactivity, not the whole page.
- Static/ISR for home, PDP, category, policies with `revalidate` + `revalidateTag` on admin edits.
- `force-dynamic` only for cart/checkout/account/admin.
- Stream with Suspense; show skeletons instead of blocking.

### 2.3 Images (Cloudinary + next/image)
- Always `next/image` with correct `sizes`; never raw `<img>` for product media.
- Cloudinary transforms: `f_auto,q_auto`, responsive widths, AVIF/WebP.
- LQIP blur placeholder; explicit width/height to prevent CLS.
- Primary PDP/hero image: `priority`; everything else lazy.

### 2.4 Fonts
- `next/font` self-hosted, `display: swap`, preloaded, subset `latin`. Max two families (serif display + sans body).

### 2.5 JS & bundles
- Dynamic-import heavy/below-fold client widgets (gallery zoom, charts, editor) with `next/dynamic`.
- Tree-shake icons (named `lucide-react` imports).
- Run `@next/bundle-analyzer` before launch; kill unexpected large deps.
- No moment.js/lodash-wholesale; use `date-fns` and native.

### 2.6 Data & DB
- `.lean()` + field projection for storefront reads.
- Indexes per `04-database-schema.md`; verify with `explain()` on hot queries (product list, search, order lookup).
- Paginate everything; never unbounded queries.

### 2.7 Third-party
- Load Razorpay checkout script only on checkout, `afterInteractive`/on-demand.
- Defer analytics; avoid render-blocking third-party CSS/JS.

## 3. Monitoring

- Vercel Analytics / Web Vitals reporting (`useReportWebVitals`) to catch field regressions.
- Error monitoring (see `10-deployment.md`).
- Track Core Web Vitals post-launch; treat regressions as bugs.

## 4. Acceptance Criteria

- [ ] Lighthouse mobile > 95 on home, PDP, and category pages.
- [ ] Valid JSON-LD (Organization, Product, Breadcrumb) passing Rich Results Test.
- [ ] Dynamic sitemap + robots correct; admin/account/api excluded from index.
- [ ] Every page has unique title, description, canonical, OG image.
- [ ] No CLS from images/fonts; LCP image prioritized.
- [ ] Bundle analyzed; no unexpected large client bundles.
