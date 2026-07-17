# Phase 08 — SEO, Optimization, QA & Launch

> Maps roadmap Phase 13 (SEO), Phase 14 (Optimization), Phase 15 (QA & Launch). **Goal: ship a fast, accessible, secure store to production.**

## Objective
Finalize SEO and structured data, hit performance budgets, complete QA (cross-browser, mobile, accessibility), pass payment testing in live mode, wire monitoring, and deploy. Read `09-seo-performance.md` and `10-deployment.md` in full.

## Scope
- SEO: metadata, JSON-LD, canonicals, OG/Twitter, sitemap, robots.
- Optimization: images, caching, lazy loading, code splitting, bundle analysis, DB indexes.
- QA: cross-browser, mobile, a11y audit, Lighthouse > 95, payment testing.
- Launch: monitoring, security headers/CSP, production deploy, handover.

## Tasks
1. **SEO**: `generateMetadata` on all routes; Organization/WebSite/Product/Breadcrumb/Review JSON-LD; canonicals + slug-change redirects; OG/Twitter images; `sitemap.ts` + `robots.ts`; validate with Rich Results Test; submit to Search Console.
2. **Performance**: audit images (next/image + Cloudinary `f_auto,q_auto`, blur, priority LCP), ISR + `revalidateTag`, dynamic-import heavy client widgets, tree-shake icons, run bundle analyzer and cut bloat, verify hot-query indexes with `explain()`.
3. **Accessibility**: full audit per `rules/accessibility.md` — keyboard, focus, contrast, ARIA, forms, alt text; fix to AA.
4. **QA**: cross-browser (Chrome, Safari, Firefox, Edge), real mobile devices (iOS Safari, Android Chrome), responsive from 320px up; e2e happy paths (Playwright): browse → cart → checkout (test mode) → order → track.
5. **Payments**: full test-mode matrix, then a **live-mode** end-to-end small real payment + refund.
6. **Security**: headers + CSP (checkout works under CSP), rate limits active, secrets server-only, dependency audit.
7. **Monitoring**: error monitoring (Sentry/Vercel), uptime on `/api/health`, payment reconciliation cron, Web Vitals reporting.
8. **Deploy**: production env vars (live keys, verified email domain, prod DB), indexes + seed in prod, custom domain + HTTPS, Razorpay live webhook verified.
9. **Handover**: admin training, env inventory (shared securely), backup procedure, repo/account transfer.

## Acceptance Criteria
- [ ] Lighthouse mobile > 95 on Performance, Accessibility, Best Practices, SEO for home, PDP, and category pages.
- [ ] Core Web Vitals within budget (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- [ ] Valid JSON-LD (Organization, Product, Breadcrumb) passes Rich Results Test.
- [ ] Sitemap + robots correct; admin/account/api/checkout excluded from index; sitemap submitted.
- [ ] Accessibility audit passes AA (keyboard, contrast, focus, alt, forms).
- [ ] e2e happy-path tests pass; cross-browser + mobile verified.
- [ ] Live-mode test payment succeeds and is refunded; webhook finalizes correctly in production.
- [ ] Security headers + CSP active; checkout works under CSP; rate limits verified.
- [ ] Monitoring, uptime, and reconciliation cron live and alerting.
- [ ] Production deployed on custom domain over HTTPS; owner trained; backups documented.

## Testing Checklist
- Lighthouse CI on key routes.
- Rich Results validation screenshots.
- Playwright e2e suite green.
- Live payment + refund receipt.
- CSP report-only pass before enforce.
- Accessibility: axe scan + manual keyboard/screen-reader spot check.

## Definition of Done
The Silver Button is live in production: fast, accessible, SEO-ready, secure, monitored, and handed over to the owner.
