import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/coupon.model";

interface CartLineForPricing {
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  couponError?: string;
}

// Store settings (hardcoded for now; will read from Settings collection later)
const FREE_SHIPPING_THRESHOLD = 99900; // ₹999 in paise
const FLAT_SHIPPING_RATE = 7900; // ₹79 in paise

/**
 * Compute cart totals from resolved items.
 * All values in paise. Coupon validated server-side.
 */
export async function computeTotals(
  items: CartLineForPricing[],
  couponCode?: string,
): Promise<CartTotals> {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  let discountTotal = 0;
  let couponError: string | undefined;

  if (couponCode) {
    await connectDB();
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true }).lean();

    if (!coupon) {
      couponError = "Coupon not found or inactive";
    } else {
      const now = new Date();
      if (coupon.startsAt && now < coupon.startsAt) {
        couponError = "Coupon not yet active";
      } else if (coupon.expiresAt && now > coupon.expiresAt) {
        couponError = "Coupon has expired";
      } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        couponError = "Coupon limit reached";
      } else if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        couponError = `Minimum order ₹${(coupon.minSubtotal / 100).toFixed(0)} required`;
      } else {
        // Calculate discount
        switch (coupon.type) {
          case "percentage": {
            const raw = Math.round((subtotal * coupon.value) / 100);
            discountTotal = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
            break;
          }
          case "fixed": {
            discountTotal = Math.min(coupon.value, subtotal);
            break;
          }
          case "free_shipping": {
            // Handled below in shipping calc
            discountTotal = 0;
            break;
          }
        }
      }
    }
  }

  // Shipping
  const afterDiscount = subtotal - discountTotal;
  let shippingTotal = FLAT_SHIPPING_RATE;

  if (afterDiscount >= FREE_SHIPPING_THRESHOLD) {
    shippingTotal = 0;
  }

  // Free shipping coupon
  if (couponCode && !couponError) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true }).lean();
    if (coupon?.type === "free_shipping") {
      shippingTotal = 0;
    }
  }

  // Tax (prices are inclusive by default, so taxTotal = 0)
  const taxTotal = 0;

  const grandTotal = afterDiscount + shippingTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    grandTotal: Math.max(grandTotal, 0),
    couponError,
  };
}
