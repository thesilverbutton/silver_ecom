# Silver Ecommerce Platform — Build Instructions

## Documentation Structure

```
/docs
├── 00-project-overview.md
├── 01-tech-stack.md
├── 02-architecture.md
├── 03-design-system.md
├── 04-database-schema.md
├── 05-api-specification.md
├── 06-authentication.md
├── 07-commerce-engine.md
├── 08-admin-dashboard.md
├── 09-seo-performance.md
├── 10-deployment.md
│
├── phases/
│   ├── phase-01-foundation.md
│   ├── phase-02-design-system.md
│   ├── phase-03-product-module.md
│   ├── phase-04-cart.md
│   ├── phase-05-checkout.md
│   ├── phase-06-orders.md
│   ├── phase-07-admin.md
│   └── phase-08-launch.md
│
└── rules/
    ├── coding-standards.md
    ├── ui-rules.md
    ├── accessibility.md
    ├── performance.md
    └── security.md
```

---

## Phase 1 — Foundation

**Goal:** A clean, production-ready base.

**Deliverables:**

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- ESLint + Prettier
- Environment configuration
- MongoDB connection
- Cloudinary configuration
- Razorpay SDK
- Resend SDK
- Shiprocket SDK
- Auth.js
- Folder structure
- Error handling
- Logging utilities

At the end of this phase, the app should run cleanly with no business logic.

---

## Phase 2 — Design System

No pages. Only reusable components.

Examples:

- Button
- Input
- Card
- Badge
- Product Card
- Gallery
- Modal
- Drawer
- Navbar
- Footer
- Section
- Typography
- Skeletons
- Empty states
- Toasts
- Loading indicators

Everything should use design tokens.

---

## Phase 3 — Database & Models

Create and validate:

- Product
- Category
- Customer
- Order
- Payment
- Review
- Wishlist
- Coupon
- Settings
- Audit Log

Also define:

- Indexes
- Validation rules
- TypeScript interfaces
- Zod schemas

No UI yet.

---

## Phase 4 — Authentication

Implement:

- Customer login
- Customer registration
- Guest checkout
- Admin login
- Session handling
- Protected routes

---

## Phase 5 — Product Engine

Build:

- Product CRUD
- Category CRUD
- Image uploads
- Product gallery
- Search
- Filters
- Sorting
- Pagination
- Related products
- Recently viewed
- Wishlist

---

## Phase 6 — Storefront

Now build pages:

- Home
- Collections
- Product listing
- Product details
- About
- Contact
- Policies

The backend already exists, so these pages become composition work.

---

## Phase 7 — Cart

Implement:

- Add/remove items
- Quantity updates
- Guest cart
- Persistent cart
- Coupon application
- Shipping estimate

---

## Phase 8 — Checkout & Payments

Flow:

```
Checkout
   ↓
Create Razorpay Order
   ↓
Customer Pays
   ↓
Verify Payment Signature
   ↓
Receive Razorpay Webhook
   ↓
Verify Webhook Signature
   ↓
Mark Order Paid
   ↓
Atomically Decrement Inventory
   ↓
Generate Invoice
   ↓
Send Confirmation Email
   ↓
Show Success Page
```

**Important:**

- The browser is **not** the source of truth.
- The webhook is.

---

## Phase 9 — Orders

**Customer:**

- Order history
- Order details
- Tracking
- Cancellation (if allowed)

**Admin:**

- Order management
- Status updates
- Refund initiation
- Tracking information

---

## Phase 10 — Shipping

Integrate Shiprocket:

- Shipment creation
- AWB generation
- Tracking
- Labels
- Status synchronization

---

## Phase 11 — Admin Dashboard

Modules:

- Dashboard
- Products
- Categories
- Orders
- Customers
- Reviews
- Coupons
- Settings
- Audit Logs

---

## Phase 12 — Jewelry-Specific Features

These are what differentiate the experience:

- Image zoom
- Fullscreen gallery
- Pinch zoom on mobile
- BIS Hallmark badge
- Certification display
- Material details
- Ring size guide
- Care instructions
- Shipping promise
- Return policy block
- Wishlist
- Recently viewed

---

## Phase 13 — SEO

Implement:

- Dynamic metadata
- JSON-LD
- Product schema
- Organization schema
- Breadcrumb schema
- Canonical URLs
- Open Graph
- Twitter Cards
- Dynamic sitemap
- robots.txt

---

## Phase 14 — Optimization

Focus on:

- Image optimization
- Route caching
- Lazy loading
- Code splitting
- Bundle analysis
- Database indexes

---

## Phase 15 — QA & Launch

Complete:

- Cross-browser testing
- Mobile testing
- Accessibility audit
- Lighthouse > 95
- Payment testing (sandbox & live)
- Error monitoring
- Production deployment

---

## Tech Stack

Keep the stack intentionally small.

| Category | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 | Full-stack, App Router |
| Language | TypeScript | Type safety |
| Styling | TailwindCSS + shadcn/ui | Consistent design system |
| Database | MongoDB Atlas | Sufficient for expected scale |
| Authentication | Auth.js | Mature and flexible |
| Image Storage | Cloudinary | Optimized media delivery |
| Payments | Razorpay | Standard for Indian ecommerce |
| Email | Resend | Simple transactional emails |
| Shipping | Shiprocket | Shipping and tracking |
| Hosting | Vercel | Excellent Next.js integration |

### Intentionally not included

- ❌ Kafka
- ❌ BullMQ
- ❌ RabbitMQ
- ❌ Elasticsearch
- ❌ Algolia
- ❌ Separate Express backend
- ❌ Prisma (unless you specifically want its developer experience)

Each dependency should exist because it solves a real problem **today**, not because it might be useful someday.

---

## Documentation Recommendation

Since an AI coding agent is being used, generate **20–25 focused Markdown documents (500–800 lines each)** instead of one enormous specification. Each document should contain:

- Objective
- Scope
- Functional requirements
- API contracts
- Database interactions
- UI requirements
- Edge cases
- Acceptance criteria
- Testing checklist
