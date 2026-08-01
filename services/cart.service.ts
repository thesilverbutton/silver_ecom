import { connectDB } from "@/lib/db";
import { Cart } from "@/models/cart.model";
import { Product } from "@/models/product.model";
import { computeTotals, type CartTotals } from "@/lib/pricing";

export interface ResolvedCartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  image: string;
  options?: Record<string, string>;
  unitPrice: number; // paise
  quantity: number;
  lineTotal: number;
  stock: number;
  flag?: "OUT_OF_STOCK" | "QTY_REDUCED" | "PRICE_CHANGED" | "REMOVED";
}

export interface ResolvedCart {
  id: string;
  items: ResolvedCartItem[];
  totals: CartTotals;
  valid: boolean; // false if any item has a flag
}

/**
 * Get or create a cart, then resolve all items against live product data.
 */
export async function getCart(cartId?: string, customerId?: string): Promise<ResolvedCart> {
  await connectDB();

  const cart = customerId
    ? await Cart.findOne({ customerId })
    : cartId
      ? await Cart.findOne({ cartId })
      : null;

  if (!cart) {
    return {
      id: "",
      items: [],
      totals: { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, grandTotal: 0 },
      valid: true,
    };
  }

  // Resolve each line against current product data
  const resolvedItems: ResolvedCartItem[] = [];
  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  for (const item of cart.items) {
    const product = productMap.get(String(item.productId));

    if (!product || product.status !== "active") {
      resolvedItems.push({
        productId: String(item.productId),
        variantId: item.variantId ? String(item.variantId) : undefined,
        title: "Product unavailable",
        slug: "",
        image: "",
        unitPrice: 0,
        quantity: item.quantity,
        lineTotal: 0,
        stock: 0,
        flag: "REMOVED",
      });
      continue;
    }

    let unitPrice = product.basePrice;
    let stock = product.stock;
    let options: Record<string, string> | undefined;

    if (product.hasVariants && item.variantId) {
      const variant = product.variants.find((v) => String(v._id) === String(item.variantId));
      if (variant) {
        unitPrice = product.basePrice + variant.priceDelta;
        stock = variant.stock;
        options = variant.options as Record<string, string>;
      } else {
        stock = 0;
      }
    }

    let flag: ResolvedCartItem["flag"];
    let qty = item.quantity;

    if (stock <= 0) {
      flag = "OUT_OF_STOCK";
      qty = 0;
    } else if (item.quantity > stock) {
      flag = "QTY_REDUCED";
      qty = stock;
    }

    resolvedItems.push({
      productId: String(item.productId),
      variantId: item.variantId ? String(item.variantId) : undefined,
      title: product.title,
      slug: product.slug,
      image: product.images[0]?.url || "",
      options,
      unitPrice,
      quantity: qty,
      lineTotal: unitPrice * qty,
      stock,
      flag,
    });
  }

  // Compute totals
  const totals = computeTotals(resolvedItems);
  const valid = !resolvedItems.some((i) => i.flag);

  return {
    id: String(cart._id),
    items: resolvedItems,
    totals,
    valid,
  };
}

/**
 * Add a product to the cart. Validates stock before adding.
 */
export async function addToCart(
  cartId: string,
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  // Validate product and stock
  const product = await Product.findOne({ _id: productId, status: "active" }).lean();
  if (!product) return { success: false, error: "Product not found" };

  let availableStock: number;
  if (product.hasVariants && variantId) {
    const variant = product.variants.find((v) => String(v._id) === variantId);
    if (!variant) return { success: false, error: "Variant not found" };
    availableStock = variant.stock;
  } else {
    availableStock = product.stock;
  }

  if (availableStock <= 0) return { success: false, error: "Out of stock" };

  // Find or create cart
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({ cartId, items: [] });
  }

  // Check if item already in cart
  const existingIdx = cart.items.findIndex(
    (i) =>
      String(i.productId) === productId &&
      (variantId ? String(i.variantId) === variantId : !i.variantId),
  );

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx]!.quantity + quantity;
    const clampedQty = Math.min(newQty, availableStock);
    cart.items[existingIdx]!.quantity = clampedQty;
  } else {
    const clampedQty = Math.min(quantity, availableStock);
    cart.items.push({
      productId: product._id,
      variantId: variantId ? (variantId as unknown as typeof product._id) : undefined,
      quantity: clampedQty,
      addedAt: new Date(),
    });
  }

  await cart.save();
  return { success: true };
}

/**
 * Update quantity of a cart item. quantity=0 removes it.
 */
export async function updateCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<{ success: boolean }> {
  await connectDB();

  const cart = await Cart.findOne({ cartId });
  if (!cart) return { success: false };

  const idx = cart.items.findIndex(
    (i) =>
      String(i.productId) === productId &&
      (variantId ? String(i.variantId) === variantId : !i.variantId),
  );

  if (idx < 0) return { success: false };

  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    // Clamp to available stock
    const product = await Product.findById(productId).lean();
    let stock = product?.stock || 0;
    if (product?.hasVariants && variantId) {
      const variant = product.variants.find((v) => String(v._id) === variantId);
      stock = variant?.stock || 0;
    }
    cart.items[idx]!.quantity = Math.min(quantity, stock);
  }

  await cart.save();
  return { success: true };
}

/**
 * Remove an item from the cart.
 */
export async function removeCartItem(
  cartId: string,
  productId: string,
  variantId?: string,
): Promise<{ success: boolean }> {
  return updateCartItem(cartId, productId, 0, variantId);
}

/**
 * Clear all items from the cart.
 */
export async function clearCart(cartId: string): Promise<{ success: boolean }> {
  await connectDB();
  await Cart.updateOne({ cartId }, { $set: { items: [] } });
  return { success: true };
}

/**
 * Get cart item count (for navbar badge).
 */
export async function getCartItemCount(cartId?: string, customerId?: string): Promise<number> {
  await connectDB();
  const cart = customerId
    ? await Cart.findOne({ customerId }).lean()
    : cartId
      ? await Cart.findOne({ cartId }).lean()
      : null;

  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
