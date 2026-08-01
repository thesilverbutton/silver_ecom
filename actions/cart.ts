"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  getCart as getCartService,
  addToCart as addToCartService,
  updateCartItem as updateCartItemService,
  removeCartItem as removeCartItemService,
  clearCart as clearCartService,
  getCartItemCount,
} from "@/services/cart.service";

const CART_COOKIE = "tsb_cart_id";
const CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Get or create a guest cartId from cookies.
 */
async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    cartId = randomUUID();
    cookieStore.set(CART_COOKIE, cartId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: CART_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return cartId;
}

export async function getCart() {
  const cartId = await getOrCreateCartId();
  return getCartService(cartId);
}

export async function addToCart(productId: string, quantity: number, variantId?: string) {
  const cartId = await getOrCreateCartId();
  const result = await addToCartService(cartId, productId, quantity, variantId);
  revalidatePath("/", "layout");
  return result;
}

export async function updateCartItem(productId: string, quantity: number, variantId?: string) {
  const cartId = await getOrCreateCartId();
  const result = await updateCartItemService(cartId, productId, quantity, variantId);
  revalidatePath("/", "layout");
  return result;
}

export async function removeCartItem(productId: string, variantId?: string) {
  const cartId = await getOrCreateCartId();
  const result = await removeCartItemService(cartId, productId, variantId);
  revalidatePath("/", "layout");
  return result;
}

export async function clearCart() {
  const cartId = await getOrCreateCartId();
  const result = await clearCartService(cartId);
  revalidatePath("/", "layout");
  return result;
}

export async function getCartCount() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) return 0;
  return getCartItemCount(cartId);
}
