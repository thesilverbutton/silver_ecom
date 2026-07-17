# Rules — Security

> This store handles payments and customer PII. Security is not optional. Pairs with `06-authentication.md`, `07-commerce-engine.md`, `10-deployment.md`.

## 1. Secrets
- All provider secrets are **server-only**. Only `NEXT_PUBLIC_*` reaches the browser, and it must contain nothing sensitive (Razorpay **key id** is public; **key secret** and **webhook secret** are not).
- No secrets in git. `.env.local` git-ignored; `.env.example` holds keys only. Validate env with Zod at boot.
- Never log secrets, tokens, signatures, or full PII. Redact in logs and AuditLog.

## 2. Payments (highest risk)
- **The verified webhook is the only place an order becomes paid.** The browser/verify-endpoint is never authoritative.
- Verify **every** Razorpay signature: payment handshake (`HMAC(order_id|payment_id, KEY_SECRET)`) and webhook (`X-Razorpay-Signature` with `WEBHOOK_SECRET`) using the **raw** request body.
- Reject invalid signatures with no state change; log with `traceId`.
- Recompute all money server-side; ignore client-sent amounts/totals/discounts.
- Idempotent finalization: dedupe by event/payment id; no double decrement, refund, or email.
- Store no card data (PCI: Razorpay-hosted). Only store Razorpay ids, method, and status.

## 3. AuthN / AuthZ
- Enforce authentication AND authorization **server-side** on every account/admin action — middleware is a first gate, not the guarantee.
- Ownership checks on all customer resources (`resource.customerId === session.user.id`).
- Staff permissions checked in the service layer, not just hidden in UI.
- Separate Customer and Admin credential stores; customers can never gain admin role.
- Passwords: bcrypt cost ≥ 12. Password reset via single-use, time-limited, hashed tokens. Generic auth errors (no account enumeration).

## 4. Input Validation & Injection
- Validate/normalize **all** inputs with Zod (body, params, query, forms, webhooks). Reject unknown fields; bound numbers; coerce safely.
- Mongoose parameterizes queries — never build queries from raw unvalidated objects (guard against operator injection like `{$gt:''}`); cast/whitelist query params.
- Sanitize rich text (product descriptions, reviews) before storage and render; escape on output. No `dangerouslySetInnerHTML` with unsanitized content.
- File uploads: signed Cloudinary only, whitelist formats, cap size, restrict folder.

## 5. Rate Limiting & Abuse (MongoDB TTL, no Redis)
- Rate-limit: login/register, password reset, checkout init, coupon apply, review submit, search, contact form.
- Backoff + generic messaging on limit. Bot-guard the contact form (honeypot/timing).
- Enforce coupon usage limits atomically (no over-redemption).

## 6. Sessions & Cookies
- Session cookies: HTTP-only, `Secure`, `SameSite=Lax`. Guest cart cookie: HTTP-only, opaque id, 30-day.
- Invalidate sessions for blocked/deactivated users on next request.
- CSRF: rely on Next.js server-action origin checks + Auth.js CSRF; verify same-origin on custom state-changing route handlers.

## 7. Headers & Transport
- HTTPS everywhere (HSTS). Set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options`/frame-ancestors, minimal `Permissions-Policy`.
- **CSP**: allow self + Cloudinary (img) + Razorpay (script/frame). Roll out report-only first, then enforce; verify checkout works under CSP.

## 8. Webhooks
- Always verify signature with raw body before parsing/acting.
- Idempotent processing; dedupe replays.
- Respond fast after persistence; do slow work retry-safely without exposing internal errors.
- Never trust webhook payload fields for money beyond what you can reconcile against the provider.

## 9. Data Protection & Privacy
- Collect minimal PII; store only what's needed. Redact PII in logs/audit diffs.
- Prod DB separate from dev; least-privilege DB user; network controls on Atlas.
- Backups encrypted; access to prod restricted. Document a data-deletion path for customer requests.
- Policy pages (privacy/terms) reflect actual data handling.

## 10. Dependencies & Supply Chain
- Only approved libraries (`01-tech-stack.md`); pin framework-critical versions. Watch for typosquatting on any new package.
- Run `npm/pnpm audit` before launch; patch high/critical. Keep Next/Auth/Mongoose updated within a release cadence.

## 11. Error Handling
- Never expose stack traces, internal messages, or provider errors to users. Return generic message + `traceId`; log full detail server-side.
- Fail closed on auth/payment ambiguity (deny, don't assume success).

## 12. Network-Exposed Surfaces
- Every new API route/endpoint must state its auth model. **No unauthenticated state-changing endpoint** ships without explicit justification.
- `/admin` and `/account` never linked from public sitemap/robots; excluded from indexing.

## 13. Pre-Launch Security Checklist
- [ ] All secrets server-only; env validated; nothing sensitive in `NEXT_PUBLIC_*`.
- [ ] Razorpay handshake + webhook signatures verified (raw body); tested with a forged signature (rejected).
- [ ] Money recomputed server-side; client tamper test fails to change price.
- [ ] Idempotent webhook (duplicate event → no double effects).
- [ ] AuthZ enforced server-side incl. staff permissions + resource ownership.
- [ ] Rate limits active on all sensitive endpoints.
- [ ] Rich text sanitized; injection/XSS spot-checked.
- [ ] Security headers + CSP enforced; checkout works.
- [ ] `audit` clean of high/critical; versions pinned.
- [ ] PII redacted in logs/audit; prod DB isolated with least-privilege access.
