# Rules — Coding Standards

> Non-negotiable. The agent follows these on every file. When in doubt, prefer the boring, typed, server-first option.

## 1. Language & Types
- TypeScript `strict` everywhere. **No `any`** (use `unknown` + narrowing). No non-null `!` unless provably safe with a comment.
- Prefer `type`/`interface` from `src/types`; do not redefine shared shapes locally.
- Validate every external input (request body, params, searchParams, env, webhook, form) with **Zod** at the boundary. Infer TS types from Zod where possible.
- Money is always **integer paise** (`number`). Never floats for money. Use a shared `formatINR(paise)` for display only.

## 2. Project Structure & Layering
- Respect the layering in `02-architecture.md`: UI → actions/api → services → models/SDKs. **UI never imports models or external SDKs directly.**
- Business logic lives in `src/services` only. No `Model.find` in components or route handlers.
- One model per file in `src/models`; one Zod schema per entity in `src/schemas`.
- Import via alias `@/*`. No deep relative `../../../`.

## 3. Next.js / React
- **Server Components by default.** Add `"use client"` only for interactivity; keep client components small and leaf-level.
- Mutations via **server actions** (`"use server"`) or route handlers; both authenticate + authorize + validate before calling services.
- Data fetching in RSC via services; avoid client fetch waterfalls. Use Suspense + skeletons.
- Use `revalidateTag`/`revalidatePath` after mutations that affect cached storefront pages.
- No secrets in client components or `NEXT_PUBLIC_*`.

## 4. Naming
- Files: `kebab-case` (`product.service.ts`, `product-card.tsx`). Components: `PascalCase`. Vars/functions: `camelCase`. Constants: `UPPER_SNAKE`. Types/interfaces: `PascalCase`.
- Booleans read as predicates (`isActive`, `hasVariants`, `canRefund`).
- Services expose verb-first methods (`getProductBySlug`, `createOrder`, `decrementStock`).

## 5. Functions & Errors
- Small, single-purpose functions. Extract when a function does two things.
- Services throw typed `AppError` subclasses (`02-architecture.md`); never return `null` to signal an error where a throw is clearer.
- Route handlers/actions catch and map errors to the response envelope with a `traceId`; never leak internals when `expose===false`.
- No empty catch blocks. Log with context or rethrow.
- Guard clauses over deep nesting; return early.

## 6. Async & Data
- Always `await` or explicitly handle promises; no floating promises.
- Storefront reads use `.lean()` + field projection. Paginate all lists; never unbounded `find()`.
- Money/stock writes use transactions or atomic operators (`07-commerce-engine.md`). Idempotency for anything retriable.

## 7. Comments & Docs
- Comment the **why**, not the what. Document non-obvious money/stock/webhook logic.
- Public service functions get a short JSDoc (params, returns, throws).
- Keep a doc in sync: if behavior diverges from `/docs`, update the doc in the same PR.

## 8. Formatting & Lint
- Prettier enforced (double quotes, semicolons, trailing commas `all`, width 100, Tailwind class sort). Do not hand-format.
- ESLint `next/core-web-vitals` + `@typescript-eslint`; fix all warnings, no disables without a justifying comment.
- No unused vars/imports. No `console.log` in committed code — use `lib/logger`.

## 9. Git & PRs
- Small, focused commits; conventional messages (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
- A change is not done until `typecheck && lint && test && build` pass locally/CI.
- No commented-out dead code. No TODOs without a tracked follow-up.

## 10. Testing
- Add/adjust tests when adding features or fixing bugs (see phase testing checklists). Unit-test services (pricing, coupons, inventory, auth), especially money/stock paths.
- Do not weaken assertions to make tests pass. Tests are contracts.

## 11. Dependencies
- Only libraries listed in `01-tech-stack.md`. Adding one requires recording the decision there. Pin versions for framework-critical packages.
- Prefer platform/native APIs over new deps.

## 12. Absolute Don'ts
- ❌ Trust client-sent prices/totals/stock.
- ❌ Finalize orders anywhere but the verified webhook.
- ❌ Log secrets, tokens, or full PII.
- ❌ Introduce Redis/Kafka/Prisma/etc. (see excluded list).
- ❌ Put business logic in components.
- ❌ Ship `any`, floating promises, or unvalidated input.
