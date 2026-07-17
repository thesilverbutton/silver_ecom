# 00 — Project Overview

> Master context document. Every other doc and every code change assumes what is written here. Read this first.

## 1. Product

**The Silver Button** is a single-brand, direct-to-consumer **handloom fashion** e-commerce store for the Indian market, serving both **men and women**. Customers browse a curated catalog organized by gender (Men / Women), view detailed product pages with fabric and weave information, add items to a cart, and check out with secure online payment. The owner manages the entire store (products, orders, customers, content) from an admin dashboard.

- **Business model:** Single-brand storefront (not a marketplace, no multi-vendor).
- **Market:** India. Currency is **INR (₹)**. Prices are tax-inclusive at display unless a line explicitly separates GST.
- **Product domain:** Handloom fashion — shirts, kurtas, sarees, dupattas, trousers, dresses, jackets, accessories.
- **Navigation:** Gender-based top-level split (Men / Women) with sub-categories under each.
- **Primary device:** Mobile. The site is built **mobile-first** and must be flawless on phones before desktop.
- **Cost posture:** Launch on free tiers (Vercel + MongoDB Atlas). Every dependency must justify itself against a near-zero monthly budget.

## 2. Goals

1. A fast, trustworthy storefront that makes handloom fashion feel premium.
2. A checkout that never loses money or double-sells stock — **the payment webhook is the source of truth, not the browser.**
3. An admin dashboard the owner can operate without a developer.
4. Lighthouse scores > 95 (Performance, Accessibility, Best Practices, SEO) on mobile.
5. Clean, typed, documented code the client owns outright at handover.

## 3. Non-Goals (Out of Scope)

- Multi-vendor / marketplace features.
- Subscriptions, memberships, or loyalty programs.
- Multi-currency or international tax handling.
- Native mobile apps.
- Anything not listed in this docs set is out of scope and quoted separately.

## 4. Personas

| Persona | Needs | Key flows |
| --- | --- | --- |
| **Guest shopper** | Browse and buy without an account | Search → PDP → cart → guest checkout |
| **Registered customer** | Order history, faster checkout, wishlist | Login → account → reorder / track |
| **Store owner (admin)** | Manage catalog, fulfill orders, see revenue | Admin login → products/orders/customers |

## 5. Core User Journeys

1. **Discover** → Home → Men/Women → Category → filter/sort → Product page.
2. **Buy** → Add to cart → Cart → Checkout → Razorpay → Success (order confirmed by webhook).
3. **Track** → Account → Orders → Order detail → Shiprocket tracking.
4. **Manage** (admin) → Products CRUD, Orders lifecycle, Coupons, Settings.

## 6. Domain Vocabulary (use these exact terms in code)

- **Product** — a sellable fashion item. May have **variants** (e.g., size, color).
- **Variant** — a purchasable SKU under a product (size/color) with its own stock and optional price delta.
- **Category** — a browsable grouping nested under a gender (e.g., Men > Shirts, Women > Sarees).
- **Gender** — top-level navigation split: Men, Women (optionally Unisex).
- **Collection** — a curated, marketing-driven grouping (may span categories, e.g., "Summer Edit").
- **Cart** — a pre-order basket, guest (cookie) or customer (DB) scoped.
- **Order** — a placed cart with a payment and fulfillment lifecycle.
- **Coupon** — a discount rule applied to a cart.
- **Fabric** — the material/weave type (e.g., Handloom Cotton, Silk, Linen, Khadi).

## 7. Success Metrics

- Storefront LCP < 2.5s on 4G mobile; CLS < 0.1; INP < 200ms.
- Zero oversell incidents (inventory decremented atomically on paid webhook only).
- Checkout completion rate tracked; abandoned carts recoverable.
- Admin can add a fully-live product in under 3 minutes.

## 8. Constraints & Assumptions

- Client provides all product content (images, descriptions, pricing, policy text).
- Client owns the domain, Razorpay merchant account (KYC), and hosting/DB accounts; the developer only configures them.
- Free-tier limits are acceptable at launch; scaling is a later, client-billed concern.
- Source code, design, and content ownership transfer to the client on final payment.

## 9. Build Philosophy

- **Small stack, boring choices.** No Redis, Kafka, BullMQ, RabbitMQ, Elasticsearch, Algolia, separate Express backend, or Prisma. See `01-tech-stack.md`.
- **Server-first.** Prefer React Server Components and server actions; ship minimal client JS.
- **Money is sacred.** All price, stock, and payment logic runs server-side and is verified against Razorpay signatures.
- **Typed end to end.** Zod at every boundary, TypeScript everywhere, no `any`.
- **Document-driven.** Each phase in `phases/` has acceptance criteria; do not mark a phase done until they pass.

## 10. How This Docs Set Is Organized

| Doc | Purpose |
| --- | --- |
| `00-project-overview.md` | This file — context and vocabulary. |
| `01-tech-stack.md` | Pinned tools, versions, env vars. |
| `02-architecture.md` | Folder layout, data flow, boundaries. |
| `03-design-system.md` | Tokens and component inventory. |
| `04-database-schema.md` | Collections, indexes, Zod, TS types. |
| `05-api-specification.md` | Route contracts. |
| `06-authentication.md` | Auth.js, sessions, roles. |
| `07-commerce-engine.md` | Cart → payment → inventory logic. |
| `08-admin-dashboard.md` | Admin modules and permissions. |
| `09-seo-performance.md` | SEO and perf requirements. |
| `10-deployment.md` | Vercel, Atlas, webhooks, launch. |
| `phases/*` | Ordered execution plan with acceptance criteria. |
| `rules/*` | Non-negotiable standards the agent must follow. |

**Reading order for the agent:** `00` → `01` → `02` → `rules/*` → the current `phases/*` doc → the relevant reference doc (`03`–`10`).
