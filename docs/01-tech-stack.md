# 01 — Tech Stack

> The complete, pinned toolset. Do not add dependencies not listed here without an explicit decision recorded in this file.

## 1. Core

| Category | Choice | Version (target) | Why |
| --- | --- | --- | --- |
| Framework | Next.js | `15.x` (App Router) | Full-stack, RSC, SEO, Vercel-native |
| Language | TypeScript | `5.x` (strict) | Type safety end to end |
| Runtime | Node.js | `20 LTS` | Vercel default, stable |
| Styling | Tailwind CSS | `3.4.x` | Utility-first design tokens |
| UI primitives | shadcn/ui + Radix | latest | Accessible, unstyled base |
| Database | MongoDB Atlas | `7.x` (Free M0) | Document model fits catalog |
| ODM | Mongoose | `8.x` | Schema validation + indexes |
| Auth | Auth.js (NextAuth) | `5.x` (beta/stable) | Sessions, credentials, roles |
| Validation | Zod | `3.x` | Runtime validation at boundaries |
| Images | Cloudinary | SDK `2.x` | Transform + CDN delivery |
| Payments | Razorpay | SDK `2.x` | Standard for Indian ecommerce |
| Email | Resend | SDK `4.x` | Transactional email |
| Shipping | Shiprocket | REST API | Shipment, AWB, tracking |
| Hosting | Vercel | — | Best Next.js integration |

> Auth.js v5 is used with the App Router. If v5 is unstable at build time, pin the latest stable v5 release and record the exact version here.

## 2. Supporting Libraries

| Purpose | Library |
| --- | --- |
| Forms | `react-hook-form` + `@hookform/resolvers` (Zod) |
| Server state / fetching | Native `fetch` + RSC; `swr` only for client-side lists that need revalidation |
| Icons | `lucide-react` |
| Date | `date-fns` |
| Class merging | `clsx` + `tailwind-merge` (via shadcn `cn`) |
| Toasts | `sonner` |
| Tables (admin) | `@tanstack/react-table` |
| Charts (admin) | `recharts` |
| PDF invoices | `@react-pdf/renderer` or server HTML→PDF (`playwright` chromium on demand) — decide in Phase 5, record here |
| Rate limiting | In-memory + MongoDB TTL (no Redis) |
| Logging | Custom logger (see `02-architecture.md`) |
| Testing | `vitest` + `@testing-library/react`; `playwright` for e2e |

## 3. Explicitly Excluded

Do **not** introduce these. If a need arises, raise it as a decision, do not add silently.

- ❌ Kafka, RabbitMQ, BullMQ (no message queues; use webhooks + DB)
- ❌ Elasticsearch, Algolia (use MongoDB text index + Atlas Search if needed)
- ❌ Separate Express backend (use Next.js API routes / server actions)
- ❌ Prisma (using Mongoose)
- ❌ Redis (use MongoDB TTL collections for ephemeral state and rate limits)

## 4. Environment Variables

Create `.env.local` (never commit). Provide `.env.example` with keys only.

```bash
# App
NEXT_PUBLIC_APP_URL=https://thesilverbutton.com
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/silver_button?retryWrites=true&w=majority
MONGODB_DB=silver_button

# Auth.js
AUTH_SECRET=            # openssl rand -base64 32
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Resend
RESEND_API_KEY=
EMAIL_FROM="The Silver Button <orders@thesilverbutton.com>"

# Shiprocket
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SHIPROCKET_PICKUP_LOCATION=

# Admin bootstrap (first-run seed only)
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

**Rules:**
- Anything sent to the browser must be prefixed `NEXT_PUBLIC_`. Secrets never get that prefix.
- Validate env at boot with a Zod schema in `src/lib/env.ts`; fail fast on missing keys.
- Razorpay `KEY_SECRET`, `WEBHOOK_SECRET`, and all provider secrets are **server-only**.

## 5. Package Scripts (target `package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "seed": "tsx scripts/seed.ts"
  }
}
```

## 6. Tooling Config

- **TypeScript:** `strict: true`, `noUncheckedIndexedAccess: true`, path alias `@/*` → `src/*`.
- **ESLint:** `next/core-web-vitals` + `@typescript-eslint`; error on unused vars, `no-explicit-any`.
- **Prettier:** 2-space, single quotes off (double), semicolons on, trailing commas `all`, print width 100. Tailwind class sorting via `prettier-plugin-tailwindcss`.
- **Node version** pinned in `.nvmrc` and `engines`.

## 7. Version Discipline

- Pin exact minor versions in `package.json` (no `^` on framework-critical packages: next, react, auth, mongoose, razorpay).
- Record any version bump and its reason in this file's changelog.

### Changelog
- _init_ — stack established per `instructions.md`; Redis removed.
