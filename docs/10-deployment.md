# 10 — Deployment & Operations

> Ship on Vercel with MongoDB Atlas free tier. Target ~₹0/month at launch. This doc covers environments, provider setup, webhooks, CI, and the launch checklist.

## 1. Environments

| Env | Branch | URL | DB |
| --- | --- | --- | --- |
| Development | local | `localhost:3000` | Atlas dev DB or local mongod |
| Preview | PR branches | Vercel preview URLs | Atlas dev DB |
| Production | `main` | custom domain | Atlas prod DB (separate) |

- Each env has its **own** provider keys (Razorpay test vs live, separate DBs). Never point preview at production data or live payments.
- Env vars set in Vercel per-environment. Local uses `.env.local` (git-ignored). Maintain `.env.example`.

## 2. Provider Setup

### 2.1 MongoDB Atlas
- Free M0 cluster; database `silver_button` (prod) and `silver_button_dev`.
- DB user with least privilege; IP access list includes Vercel (0.0.0.0/0 acceptable for serverless, prefer Atlas + network controls).
- Create indexes via a migration/seed step; verify they exist in prod.
- Enable backups if plan allows; otherwise schedule periodic `mongodump` (documented for the client).

### 2.2 Cloudinary
- Unsigned upload disabled; use **signed** uploads only (server signs). Folder `products/`. Restrict formats/size. Set delivery `f_auto,q_auto`.

### 2.3 Razorpay
- **Test mode** keys for dev/preview; **Live** keys for production only.
- Configure webhook endpoint `https://<domain>/api/webhooks/razorpay` with a strong secret (`RAZORPAY_WEBHOOK_SECRET`); subscribe to `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
- Client completes merchant KYC (their responsibility). Store only keys, never card data.

### 2.4 Resend
- Verify sending domain (SPF/DKIM DNS records). `EMAIL_FROM` on the verified domain. Test deliverability before launch.

### 2.5 Shiprocket
- Account + pickup location configured by client. API credentials in env. Token auto-refresh on 401 (see `05` §5). Webhook `https://<domain>/api/webhooks/shiprocket` for status sync.

## 3. Vercel Configuration

- Framework preset: Next.js. Node 20. Region closest to India users (e.g., `bom1`) for functions.
- Env vars per environment (all secrets server-only; only `NEXT_PUBLIC_*` exposed).
- Custom domain + automatic HTTPS; set `NEXT_PUBLIC_APP_URL`/`AUTH_URL` accordingly; `AUTH_TRUST_HOST=true`.
- Cron (Vercel Cron) for: payment reconciliation sweep (orders `pending` with captured Razorpay payment but missed webhook), abandoned-cart cleanup relies on TTL (no cron needed), and optional low-stock digest email.

## 4. Security Headers & CSP

Set in `next.config.js` headers or middleware:
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (except where framing needed), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.
- CSP allowing self + Cloudinary (images), Razorpay (checkout script/frame), Resend (none client-side). Test checkout works under CSP before launch.

## 5. CI / Quality Gates

On every PR (GitHub Actions or Vercel checks):
- `pnpm install` → `typecheck` → `lint` → `test` → `build`.
- Block merge if any fail. Preview deploy per PR for manual QA.
- Optional: Lighthouse CI on preview for storefront routes.

## 6. Observability

- **Error monitoring:** Sentry (or Vercel's) capturing server + client errors with `traceId`. Alert on payment/webhook errors.
- **Logs:** structured JSON to Vercel; filter by `traceId`. Never log secrets/PII.
- **Uptime:** external ping on `/api/health`.
- **Payment reconciliation:** daily job compares Razorpay captured payments vs orders marked paid; flags mismatches.

## 7. Data & Backups

- Prod DB separate from dev. Regular backups (Atlas snapshots or scheduled dump), retention documented.
- No destructive migration without a backup. Migrations are idempotent scripts in `scripts/`.

## 8. Runbooks

- **Webhook not received:** reconciliation job or admin "re-check payment" action queries Razorpay by `razorpayOrderId` and finalizes if captured.
- **Oversold order (`needs_review`):** admin refunds shortfall, notifies customer, adjusts stock.
- **Shiprocket down:** orders stay `paid`/`processing`; retry shipment creation; manual AWB fallback.
- **Rollback:** Vercel instant rollback to previous deployment; DB changes must be backward-compatible within a release.

## 9. Launch Checklist (see Phase 08 for full QA)

- [ ] All env vars set in Vercel production (live Razorpay, verified Resend domain, prod DB).
- [ ] Razorpay live webhook configured + signature verified with a test event.
- [ ] Indexes created in prod DB; seed run (admin user, categories, settings).
- [ ] Custom domain live over HTTPS; canonical/OG URLs use prod domain.
- [ ] Sitemap + robots correct; submitted to Search Console.
- [ ] Security headers + CSP active; checkout works under CSP.
- [ ] Error monitoring + uptime + reconciliation cron active.
- [ ] End-to-end test order in **live** mode with a real small payment, then refunded.
- [ ] Admin credentials handed over; owner trained on dashboard.
- [ ] Backup procedure documented and verified.

## 10. Handover

- Transfer repo ownership, env var inventory (values shared securely, not in git), provider account access, and this docs set. Ownership of code/design/content transfers on final payment.
