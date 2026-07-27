/**
 * Shared TypeScript types for The Silver Button.
 * These mirror the DB schema but are framework-agnostic (no Mongoose deps).
 * Used across services, actions, and components.
 */

// ─── Common ────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    traceId?: string;
  };
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

// ─── Product ───────────────────────────────────────────────────────────────

export type ImageLabel = "Front" | "Back" | "Zoomed" | "Customized" | "Type 1" | "Type 2" | "Type 3";

export interface ProductImage {
  url: string;
  publicId: string;
  label: ImageLabel;
  alt: string;
  width: number;
  height: number;
  position: number;
}

export interface Variant {
  _id: string;
  sku: string;
  options: Record<string, string>;
  priceDelta: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  collectionIds: string[];
  gender: "men" | "women" | "unisex";
  brand: string;
  images: ProductImage[];
  basePrice: number;
  compareAtPrice?: number;
  currency: string;
  hasVariants: boolean;
  variants: Variant[];
  stock: number;
  sku?: string;
  // Fashion / handloom attributes
  fabric: string;
  weave?: string;
  color?: string;
  pattern?: string;
  occasion?: string;
  fit?: string;
  careInstructions?: string;
  sizeChart?: string;
  madeIn?: string;
  // Merchandising
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  status: "draft" | "active" | "archived";
  ratingAverage: number;
  ratingCount: number;
  seo?: { title?: string; description?: string; ogImage?: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Category ──────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string; alt: string };
  parentId?: string;
  kind: "category" | "collection";
  position: number;
  isActive: boolean;
  seo?: { title?: string; description?: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ──────────────────────────────────────────────────────────────

export interface Address {
  _id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified?: string;
  addresses: Address[];
  defaultAddressId?: string;
  wishlist: string[];
  role: "customer";
  isBlocked: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin User ────────────────────────────────────────────────────────────

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  variantId?: string;
  sku?: string;
  title: string;
  image: string;
  options?: Record<string, string>;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderEvent {
  at: string;
  status: string;
  note?: string;
  by?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId?: string;
  isGuest: boolean;
  email: string;
  phone: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded" | "partially_refunded";
  fulfillmentStatus: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentId?: string;
  shiprocketOrderId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  invoiceUrl?: string;
  notes?: string;
  timeline: OrderEvent[];
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ───────────────────────────────────────────────────────────────

export interface PaymentRefund {
  refundId: string;
  amount: number;
  status: string;
  at: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  provider: "razorpay";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  method?: string;
  refunds: PaymentRefund[];
  errorCode?: string;
  errorDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  productId: string;
  customerId?: string;
  authorName: string;
  orderId?: string;
  rating: number;
  title?: string;
  body: string;
  images?: { url: string; publicId: string }[];
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// ─── Coupon ────────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  appliesTo?: {
    categoryIds?: string[];
    productIds?: string[];
  };
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Settings ──────────────────────────────────────────────────────────────

export interface Settings {
  _id: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  gstEnabled: boolean;
  gstPercent?: number;
  freeShippingThreshold?: number;
  flatShippingRate: number;
  codEnabled: boolean;
  returnWindowDays: number;
  originPincode: string;
  socials: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  announcementBar?: {
    text: string;
    isActive: boolean;
  };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
  updatedAt: string;
}

// ─── Audit Log ─────────────────────────────────────────────────────────────

export interface AuditLog {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole: "admin" | "staff" | "system";
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
  traceId?: string;
  createdAt: string;
}

// ─── Cart ──────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  cartId?: string;
  customerId?: string;
  items: CartItem[];
  couponCode?: string;
  updatedAt: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin" | "staff";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}
