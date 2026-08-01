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
}

// Store settings (hardcoded for now; will read from Settings collection later)
const FREE_SHIPPING_THRESHOLD = 99900; // ₹999 in paise
const FLAT_SHIPPING_RATE = 7900; // ₹79 in paise

/**
 * Compute cart totals from resolved items.
 * All values in paise.
 */
export function computeTotals(items: CartLineForPricing[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountTotal = 0;

  // Shipping
  const shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;

  // Tax (prices are inclusive by default, so taxTotal = 0)
  const taxTotal = 0;

  const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    grandTotal: Math.max(grandTotal, 0),
  };
}
