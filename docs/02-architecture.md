# 02 — Architecture

> How the code is organized and how data flows. The agent must match this structure exactly.

## 1. High-Level Shape

A single Next.js 15 App Router application. No separate backend. Three surfaces share one codebase:

- **Storefront** (`/`) — public, RSC-first, SEO-critical.
- **Account** (`/account/*`) — authenticated customer area.
- **Admin** (`/admin/*`) — authenticated, role-gated owner dashboard.

Server logic lives in **server actions** (mutations tied to UI) and **route handlers** (`/api/*` for webhooks, third-party callbacks, and public JSON contracts).

```
Browser ──▶ RSC page (server) ──▶ service layer ──▶ Mongoose ──▶ MongoDB Atlas
   │                                   │
   │ server action / fetch             ├──▶ Cloudinary (images)
   ▼                                   ├──▶ Razorpay (payments)
Client component (minimal JS)          ├──▶ Resend (email)
                                       └──▶ Shiprocket (shipping)

Razorpay ──(webhook)──▶ /api/webhooks/razorpay ──▶ verify signature ──▶ mark paid ──▶ decrement stock
```

## 2. Folder Structure

```
src/
├── app/
│   ├── (storefront)/            # public route group
│   │   ├── page.tsx             # Home
│   │   ├── shop/
│   │   ├── collections/[slug]/
│   │   ├── products/[slug]/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── about/
│   │   ├── contact/
│   │   └── policies/[slug]/
│   ├── (account)/account/       # customer area (auth required)
│   │   ├── page.tsx
│   │   ├── orders/
│   │   └── wishlist/
│   ├── (admin)/admin/           # admin area (role: admin)
│   │   ├── page.tsx             # dashboard
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   ├── settings/
│   │   └── audit-logs/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── webhooks/razorpay/route.ts
│   │   ├── webhooks/shiprocket/route.ts
│   │   ├── search/route.ts
│   │   ├── sitemap.xml/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx               # root layout, providers, fonts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── not-found.tsx
├── components/
│   ├── ui/                      # shadcn primitives (Button, Input, ...)
│   ├── product/                 # ProductCard, Gallery, VariantSelector
│   ├── cart/                    # CartDrawer, CartLine
│   ├── checkout/
│   ├── layout/                  # Navbar, Footer, MobileNav
│   └── admin/                   # DataTable, StatCard, forms
├── lib/
│   ├── db.ts                    # Mongoose connection (cached)
│   ├── env.ts                   # Zod-validated env
│   ├── auth.ts                  # Auth.js config + helpers
│   ├── logger.ts                # structured logger
│   ├── cloudinary.ts
│   ├── razorpay.ts
│   ├── resend.ts
│   ├── shiprocket.ts
│   ├── errors.ts                # AppError hierarchy
│   └── utils.ts                 # cn(), formatINR(), slugify()
├── models/                      # Mongoose models (one file per collection)
├── schemas/                     # Zod schemas (validation contracts)
├── services/                    # business logic (framework-agnostic)
│   ├── product.service.ts
│   ├── cart.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   ├── inventory.service.ts
│   ├── coupon.service.ts
│   └── shipping.service.ts
├── actions/                     # server actions ("use server")
├── types/                       # shared TS types
└── config/                      # site config, nav, constants
```

## 3. Layering Rules

```
UI (app/, components/)  →  actions/ or api/  →  services/  →  models/ (+ external SDKs in lib/)
```

- **UI never imports models or SDKs directly.** It calls a server action or route handler.
- **Actions/route handlers** validate input (Zod), authenticate/authorize, then call **services**.
- **Services** hold business logic and are the only layer that touches Mongoose models and external SDKs.
- **Services are pure of HTTP** — they take typed args and return typed results or throw `AppError`.

This keeps logic testable and prevents money/stock logic from leaking into components.

## 4. Rendering Strategy

| Surface | Strategy |
| --- | --- |
| Home, PDP, collections, policies | RSC + ISR (`revalidate`) with tag-based invalidation |
| Shop listing with filters | RSC with `searchParams`; paginate server-side |
| Cart, checkout | Dynamic (per-request), client interactivity where needed |
| Account, admin | Dynamic, `force-dynamic`, auth-gated |
| Search suggestions | Route handler `/api/search`, debounced client fetch |

- Prefer **Server Components** by default. Add `"use client"` only for interactivity (forms, drawers, galleries).
- Use `revalidateTag` / `revalidatePath` after admin mutations to refresh cached storefront pages.

## 5. Data Access

- One cached Mongoose connection (`lib/db.ts`) reused across invocations (guard against hot-reload duplicate connections via `global`).
- All queries go through **services**. No inline `Model.find` in components or actions.
- Reads for storefront use `.lean()` and select only needed fields.
- Writes that touch money/stock use **transactions** or atomic operators (`findOneAndUpdate` with conditions). See `07-commerce-engine.md`.

## 6. Error Handling

Define an error hierarchy in `lib/errors.ts`:

```ts
class AppError extends Error { code: string; status: number; expose: boolean }
class ValidationError extends AppError   // 400
class AuthError extends AppError         // 401
class ForbiddenError extends AppError    // 403
class NotFoundError extends AppError     // 404
class ConflictError extends AppError     // 409 (e.g., out of stock)
class PaymentError extends AppError      // 402
class ExternalServiceError extends AppError // 502
```

- Services throw typed errors. Route handlers/actions map them to responses.
- Never leak internal messages when `expose === false`; return a generic message + a `traceId`.
- UI shows friendly messages; log the full error server-side with the `traceId`.
- `app/error.tsx` (segment) and `app/global-error.tsx` for React render errors; `not-found.tsx` for 404.

## 7. Logging

`lib/logger.ts` — structured JSON logs (level, msg, traceId, context). Levels: `debug`, `info`, `warn`, `error`.

- Generate a `traceId` per request/action and thread it through.
- Log every: payment event, webhook receipt + verification result, inventory decrement, admin mutation (also persisted to `AuditLog`), external API failure.
- Never log secrets, full card data (there is none), or full customer PII beyond what's needed. Redact tokens.
- In production, logs go to Vercel; keep them parseable JSON.

## 8. Configuration & Feature Flags

- `config/site.ts` — brand name, contact, social, currency `INR`, locale `en-IN`, shipping origin pincode.
- Runtime store settings (free-shipping threshold, COD on/off, return window) live in the **Settings** collection, cached and read via `settings.service`.

## 9. Security Posture (summary — see `rules/security.md`)

- All secrets server-only; validate signatures on every webhook.
- Authorize every admin/account action server-side (never trust the client).
- Rate-limit auth, checkout, and search endpoints (MongoDB TTL counter, no Redis).
- Set security headers and a strict CSP in `next.config.js` / middleware.

## 10. Middleware

`middleware.ts` handles: auth gate for `/account/*` and `/admin/*`, security headers, and locale/canonical normalization. Keep it thin — heavy checks belong in services.
