# 04 — Database Schema

> MongoDB via Mongoose. This doc is the single source of truth for data shape, indexes, and validation. Every collection has: a Mongoose model (`src/models`), a Zod schema (`src/schemas`), and a TS interface (`src/types`). Keep the three in sync.

## Conventions

- **IDs:** MongoDB `ObjectId`. Expose as string in API responses.
- **Money:** store as **integer paise** (₹1 = 100 paise). Never store floats for money. Format to ₹ only at display.
- **Timestamps:** every collection has `createdAt`, `updatedAt` (`timestamps: true`).
- **Soft delete:** products/categories use `status`/`isActive` rather than hard delete; orders are never deleted.
- **Slugs:** unique, lowercase, kebab-case, generated from name; immutable after first publish (redirect on change).
- **Refs:** store `ObjectId` refs; denormalize small display fields (name, image, price snapshot) where read performance matters (esp. Order line items).

---

## 1. Product

Sellable jewelry item. Supports variants.

```ts
interface Product {
  _id: ObjectId;
  title: string;
  slug: string;                 // unique
  description: string;          // rich text / markdown
  shortDescription?: string;
  categoryId: ObjectId;         // ref Category
  collectionIds: ObjectId[];    // optional curated groups
  brand: 'The Silver Button';
  images: ProductImage[];       // ordered; first is primary
  basePrice: number;            // paise
  compareAtPrice?: number;      // paise, for strikethrough
  currency: 'INR';
  hasVariants: boolean;
  variants: Variant[];          // empty if hasVariants=false
  stock: number;                // used only when hasVariants=false
  sku?: string;
  // Jewelry attributes
  material: string;             // e.g. "925 Sterling Silver"
  purity?: string;              // e.g. "92.5%"
  weightGrams?: number;
  dimensions?: string;
  stone?: string;
  bisHallmarked: boolean;
  certification?: string;
  careInstructions?: string;
  // Merchandising
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  status: 'draft' | 'active' | 'archived';
  ratingAverage: number;        // 0–5, denormalized from reviews
  ratingCount: number;
  seo?: { title?: string; description?: string; ogImage?: string };
  createdAt: Date; updatedAt: Date;
}

interface ProductImage { url: string; publicId: string; alt: string; width: number; height: number; position: number; }

interface Variant {
  _id: ObjectId;
  sku: string;                  // unique across variants
  options: Record<string, string>; // e.g. { size: "16", finish: "Oxidised" }
  priceDelta: number;           // paise, +/- from basePrice
  stock: number;
  image?: string;               // optional variant image url
  isActive: boolean;
}
```

**Indexes**
- `{ slug: 1 }` unique
- `{ status: 1, isFeatured: 1 }`
- `{ categoryId: 1, status: 1 }`
- `{ tags: 1 }`
- `{ 'variants.sku': 1 }` sparse unique
- Text index: `{ title: 'text', description: 'text', tags: 'text' }` (weights title>tags>description) — or Atlas Search if enabled.

**Validation (Zod highlights)**
- `title` 3–160 chars; `slug` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `basePrice >= 0`; `compareAtPrice` (if set) `> basePrice`.
- If `hasVariants` then `variants.length >= 1` and top-level `stock` ignored; else `stock >= 0`.
- Every active product must have ≥1 image.

---

## 2. Category

```ts
interface Category {
  _id: ObjectId;
  name: string;
  slug: string;                 // unique
  description?: string;
  image?: { url: string; publicId: string; alt: string };
  parentId?: ObjectId;          // ref Category, for sub-categories
  position: number;             // manual ordering
  isActive: boolean;
  seo?: { title?: string; description?: string };
  createdAt: Date; updatedAt: Date;
}
```
**Indexes:** `{ slug: 1 }` unique, `{ parentId: 1, position: 1 }`, `{ isActive: 1 }`.

> **Collection** (curated marketing group) uses the same shape as Category with `type: 'collection'`, or a separate `Collection` model if fields diverge. Default: one `Category` model with a `kind: 'category' | 'collection'` discriminator to avoid a redundant collection.

---

## 3. Customer

Registered users. (Guests are not stored as Customers; their data lives on the Order.)

```ts
interface Customer {
  _id: ObjectId;
  name: string;
  email: string;                // unique, lowercased
  passwordHash?: string;        // bcrypt; absent for OAuth-only
  phone?: string;               // E.164 or Indian 10-digit
  emailVerified?: Date;
  addresses: Address[];
  defaultAddressId?: ObjectId;
  wishlist: ObjectId[];         // ref Product
  role: 'customer';             // customers are always 'customer'
  isBlocked: boolean;
  lastLoginAt?: Date;
  createdAt: Date; updatedAt: Date;
}

interface Address {
  _id: ObjectId;
  label?: string;               // Home / Work
  fullName: string;
  phone: string;
  line1: string; line2?: string;
  city: string; state: string; pincode: string; country: 'India';
  isDefault: boolean;
}
```
**Indexes:** `{ email: 1 }` unique, `{ phone: 1 }` sparse.
**Validation:** email format; Indian pincode `^[1-9][0-9]{5}$`; phone `^[6-9]\d{9}$` (10-digit) or E.164.

### AdminUser
Store owner/staff. Separate from Customer for clear privilege separation.
```ts
interface AdminUser {
  _id: ObjectId; name: string; email: string; passwordHash: string;
  role: 'admin' | 'staff'; permissions: string[]; isActive: boolean;
  lastLoginAt?: Date; createdAt: Date; updatedAt: Date;
}
```
**Indexes:** `{ email: 1 }` unique. Seeded once from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

---

## 4. Order

Immutable financial record. Never hard-deleted.

```ts
interface Order {
  _id: ObjectId;
  orderNumber: string;          // human-friendly, e.g. TSB-20260716-0007, unique
  customerId?: ObjectId;        // null for guest
  isGuest: boolean;
  email: string;
  phone: string;
  items: OrderItem[];           // price snapshot at purchase time
  shippingAddress: Address;
  billingAddress?: Address;
  // Money (all paise)
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: 'INR';
  // Lifecycle
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentId?: ObjectId;         // ref Payment
  // Shipping / Shiprocket
  shiprocketOrderId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  // Meta
  invoiceUrl?: string;
  notes?: string;
  timeline: OrderEvent[];       // audit of status changes
  cancelledReason?: string;
  createdAt: Date; updatedAt: Date;
}

interface OrderItem {
  productId: ObjectId; variantId?: ObjectId; sku?: string;
  title: string; image: string; options?: Record<string,string>;
  unitPrice: number;            // paise, snapshot
  quantity: number;
  lineTotal: number;            // unitPrice * quantity
}

interface OrderEvent { at: Date; status: string; note?: string; by?: string; }
```
**Indexes**
- `{ orderNumber: 1 }` unique
- `{ customerId: 1, createdAt: -1 }`
- `{ email: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`
- `{ paymentStatus: 1 }`
- `{ awbCode: 1 }` sparse

**Rules:** order created with `status:'pending'`; transitions to `paid` **only** via verified Razorpay webhook (see `07-commerce-engine.md`). `grandTotal` recomputed server-side; never trusted from client.

---

## 5. Payment

One record per Razorpay order attempt; source of truth for reconciliation.

```ts
interface Payment {
  _id: ObjectId;
  orderId: ObjectId;            // ref Order
  provider: 'razorpay';
  razorpayOrderId: string;      // unique
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;               // paise
  currency: 'INR';
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
  method?: string;              // card/upi/netbanking/wallet
  refunds: { refundId: string; amount: number; status: string; at: Date }[];
  webhookEvents: { event: string; at: Date; verified: boolean }[];
  errorCode?: string; errorDescription?: string;
  createdAt: Date; updatedAt: Date;
}
```
**Indexes:** `{ razorpayOrderId: 1 }` unique, `{ orderId: 1 }`, `{ razorpayPaymentId: 1 }` sparse, `{ status: 1 }`.

---

## 6. Review

```ts
interface Review {
  _id: ObjectId;
  productId: ObjectId;
  customerId?: ObjectId; authorName: string;
  orderId?: ObjectId;           // for "verified purchase"
  rating: number;               // 1–5 int
  title?: string; body: string;
  images?: { url: string; publicId: string }[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date; updatedAt: Date;
}
```
**Indexes:** `{ productId: 1, status: 1, createdAt: -1 }`, `{ customerId: 1 }`.
**Rule:** only `approved` reviews affect `Product.ratingAverage`/`ratingCount` (recompute on moderation).

---

## 7. Wishlist

Wishlist for **registered** customers lives on `Customer.wishlist`. For **guests**, keep client-side (localStorage) and merge on login. A standalone `Wishlist` collection is only needed if analytics require it — default: no separate collection. If created:
```ts
interface Wishlist { _id: ObjectId; customerId: ObjectId; productIds: ObjectId[]; updatedAt: Date; }
```

---

## 8. Coupon

```ts
interface Coupon {
  _id: ObjectId;
  code: string;                 // unique, uppercased
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;                // percent (0–100) or paise for fixed
  minSubtotal?: number;         // paise threshold
  maxDiscount?: number;         // paise cap for percentage
  appliesTo?: { categoryIds?: ObjectId[]; productIds?: ObjectId[] };
  usageLimit?: number;          // total redemptions
  usageCount: number;
  perCustomerLimit?: number;
  startsAt?: Date; expiresAt?: Date;
  isActive: boolean;
  createdAt: Date; updatedAt: Date;
}
```
**Indexes:** `{ code: 1 }` unique, `{ isActive: 1, expiresAt: 1 }`.
**Validation:** percentage `value` 1–100; fixed `value > 0`; `usageCount <= usageLimit` enforced atomically at redemption.

---

## 9. Settings

Single document (singleton) for store configuration editable by admin.

```ts
interface Settings {
  _id: ObjectId;                // fixed key, e.g. 'store'
  storeName: string; supportEmail: string; supportPhone: string;
  currency: 'INR'; gstEnabled: boolean; gstPercent?: number;
  freeShippingThreshold?: number; // paise
  flatShippingRate: number;        // paise
  codEnabled: boolean;
  returnWindowDays: number;
  originPincode: string;
  socials: { instagram?: string; facebook?: string; whatsapp?: string };
  announcementBar?: { text: string; isActive: boolean };
  policies: { shipping: string; returns: string; privacy: string; terms: string };
  updatedAt: Date;
}
```
**Access:** read via cached `settings.service`; write only by admin, logged to AuditLog.

---

## 10. AuditLog

Immutable trail of admin/system actions.

```ts
interface AuditLog {
  _id: ObjectId;
  actorId?: ObjectId; actorEmail?: string; actorRole: 'admin' | 'staff' | 'system';
  action: string;               // 'product.update', 'order.refund', 'settings.update'
  entity: string;               // collection name
  entityId?: string;
  before?: unknown; after?: unknown; // diff snapshots (redacted)
  ip?: string; userAgent?: string; traceId?: string;
  createdAt: Date;
}
```
**Indexes:** `{ createdAt: -1 }`, `{ actorId: 1, createdAt: -1 }`, `{ entity: 1, entityId: 1 }`. Consider a TTL (e.g., 365 days) to bound growth.

---

## Ephemeral collections (replaces Redis)

- **Cart** (guest & customer) — see `07-commerce-engine.md`. Guest carts keyed by cookie id; TTL index (e.g., 30 days) on `updatedAt`.
- **RateLimit** — `{ key, count, expiresAt }` with TTL index on `expiresAt` for auth/checkout/search throttling.
- **Session** — Auth.js may use DB sessions (Mongoose adapter) or JWT; see `06-authentication.md`.

## Seed Data

`scripts/seed.ts` seeds: one AdminUser (from env), core categories (Rings, Earrings, Chains, Pendants, Bracelets, Anklets), the Settings singleton, and sample products from `products.json` when populated. Seeds must be idempotent (upsert by slug/email).
