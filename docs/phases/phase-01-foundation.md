# Phase 01 — Foundation

> Maps roadmap Phases 1 (Foundation), 3 (Database & Models), 4 (Auth foundations). **Goal: a clean, production-ready base that runs with no business logic.**

## Objective
Stand up the Next.js 15 app, wire every external SDK behind typed clients, define all data models + Zod schemas, and establish auth, error handling, and logging. At the end, the app boots, connects to MongoDB, and passes typecheck/lint/build with zero business features.

## Scope
- Project scaffold, tooling, config.
- Env validation, DB connection, SDK clients.
- All 10 collections as Mongoose models + Zod schemas + TS types.
- Auth.js base config (customer + admin credentials), middleware gates.
- Error hierarchy, logger, base layout with fonts/providers.
- Seed script.

Out of scope: any UI features, catalog pages, cart, checkout.

## Tasks
1. **Scaffold**: `create-next-app` (App Router, TS, Tailwind, ESLint), path alias `@/*`, `strict` TS, Prettier + tailwind plugin. Add scripts from `01-tech-stack.md`.
2. **Env**: `src/lib/env.ts` Zod-validates all env vars; fail fast. Add `.env.example`.
3. **DB**: `src/lib/db.ts` cached Mongoose connection (global guard). `/api/health` returns db status.
4. **SDK clients**: `lib/cloudinary.ts`, `lib/razorpay.ts`, `lib/resend.ts`, `lib/shiprocket.ts` — thin typed wrappers reading env; no logic yet.
5. **Errors + logging**: `lib/errors.ts` (AppError hierarchy per `02-architecture.md`), `lib/logger.ts` (structured JSON, traceId).
6. **Models**: create `src/models/*` for Product, Category, Customer, AdminUser, Order, Payment, Review, Coupon, Settings, AuditLog (+ Cart, RateLimit ephemeral). Apply all indexes from `04-database-schema.md`.
7. **Schemas/types**: mirror each model in `src/schemas/*` (Zod) and `src/types/*`.
8. **Auth**: `lib/auth.ts` with customer + admin Credentials providers, JWT sessions, role/permission callbacks. `middleware.ts` gating `/account/*` and `/admin/*`.
9. **Layout**: root layout with `next/font` (serif + sans), providers (session, toaster), `config/site.ts`.
10. **Seed**: `scripts/seed.ts` idempotent — admin user (env), core categories, Settings singleton.
11. **Folder structure**: create empty `services/`, `actions/`, `components/{ui,layout,product,cart,checkout,admin}` per `02-architecture.md`.

## Acceptance Criteria
- [ ] `pnpm dev` boots with no errors; `/api/health` returns `{ ok:true, db:'up' }`.
- [ ] `pnpm typecheck && pnpm lint && pnpm build` all pass clean.
- [ ] Missing env var causes a clear boot-time failure (env validation works).
- [ ] All 10 models load; indexes created in DB (verified).
- [ ] Seed creates admin, categories, settings; re-running seed does not duplicate.
- [ ] Visiting `/admin` unauthenticated redirects to `/admin/login`; `/account` redirects to `/login`.
- [ ] No business logic, no catalog UI present.

## Testing Checklist
- Env schema rejects missing/invalid keys.
- DB connection reused across hot reloads (no connection leak warnings).
- Model validation: invalid docs rejected by Zod + Mongoose.
- Middleware redirects verified for both areas.

## Definition of Done
App is a clean, typed, connected shell with data layer + auth scaffolding, ready for the design system.
