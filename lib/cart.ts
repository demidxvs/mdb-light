"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createVariantKey,
  normalizeSelectedOptionsMap,
  type SelectedOptionMap,
} from "@/lib/attribute-options";
import { getDeliveryOption, normalizeDeliveryType } from "@/lib/pricing.mjs";

export const CART_UPDATED_EVENT = "mdb-cart-updated";
const GUEST_CART_STORAGE_KEY = "mdb-light-guest-cart";
export const PROMO_CODE_STORAGE_KEY = "mdb-light-promo-code";

type CartRow = {
  id: string;
  user_id: string;
  currency: string;
  discount_cents?: number | null;
};

export type GuestCartItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  delivery_type?: string | null;
  delivery_cents?: number | null;
  currency: string;
  selected_color?: string | null;
  selected_length?: string | null;
  selected_material?: string | null;
  selected_options?: SelectedOptionMap | null;
  variant_key: string;
  product_snapshot: {
    sku?: string;
    slug?: string;
    name?: string;
    image_url?: string | null;
    delivery_type?: string | null;
    delivery_cents?: number | null;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: SelectedOptionMap | null;
  } | null;
};

type AddToCartInput = {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  selectedColor?: string | null;
  selectedLength?: string | null;
  selectedMaterial?: string | null;
  selectedOptions?: SelectedOptionMap | null;
  selectedOptionLabels?: SelectedOptionMap | null;
  unitPriceCents: number;
  deliveryType?: string | null;
  currency: string;
  quantity?: number;
};

export function emitCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  }
}

function getGuestCartItemId(
  productId: string,
  variantKey: string,
  selectedColor?: string | null,
  selectedLength?: string | null,
  selectedMaterial?: string | null,
) {
  return [
    productId,
    variantKey,
    selectedColor?.trim() || "",
    selectedLength?.trim() || "",
    selectedMaterial?.trim() || "",
  ].join("::");
}

export function readGuestCartItems() {
  if (typeof window === "undefined") return [] as GuestCartItem[];

  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCartItems(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
}

export function replaceGuestCartItems(items: GuestCartItem[]) {
  writeGuestCartItems(items);
  emitCartUpdated();
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  emitCartUpdated();
}

export function readStoredPromoCode() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PROMO_CODE_STORAGE_KEY) || "";
}

export function writeStoredPromoCode(code: string) {
  if (typeof window === "undefined") return;
  const normalizedCode = code.trim();
  if (normalizedCode) {
    window.localStorage.setItem(PROMO_CODE_STORAGE_KEY, normalizedCode);
  } else {
    window.localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  }
}

export function clearStoredPromoCode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
}

export function getGuestCartCount() {
  return readGuestCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function updateGuestCartItemQuantity(itemId: string, nextQuantity: number) {
  const currentItems = readGuestCartItems();
  const nextItems =
    nextQuantity <= 0
      ? currentItems.filter((item) => item.id !== itemId)
      : currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: nextQuantity } : item,
        );

  writeGuestCartItems(nextItems);
  emitCartUpdated();
}

function addProductToGuestCart(input: AddToCartInput) {
  const quantityToAdd = Math.max(1, input.quantity ?? 1);
  const selectedColor = input.selectedColor?.trim() || null;
  const selectedLength = input.selectedLength?.trim() || null;
  const selectedMaterial = input.selectedMaterial?.trim() || null;
  const selectedOptions = normalizeSelectedOptionsMap(input.selectedOptions);
  const selectedOptionLabels = normalizeSelectedOptionsMap(input.selectedOptionLabels);
  const variantKey = createVariantKey(selectedOptions);
  const delivery = getDeliveryOption(input.deliveryType);
  const itemId = getGuestCartItemId(
    input.productId,
    variantKey,
    selectedColor,
    selectedLength,
    selectedMaterial,
  );

  const items = readGuestCartItems();
  const existingItem = items.find((item) => item.id === itemId);

  if (existingItem) {
    writeGuestCartItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: item.quantity + quantityToAdd,
              unit_price_cents: input.unitPriceCents,
              delivery_type: delivery.type,
              delivery_cents: delivery.priceCents,
              currency: input.currency,
              selected_color: selectedColor,
              selected_length: selectedLength,
              selected_material: selectedMaterial,
              selected_options: selectedOptions,
              product_snapshot: {
                sku: input.sku,
                slug: input.slug,
                name: input.name,
                image_url: input.imageUrl,
                delivery_type: delivery.type,
                delivery_cents: delivery.priceCents,
                selected_color: selectedColor,
                selected_length: selectedLength,
                selected_material: selectedMaterial,
                selected_options: selectedOptionLabels,
              },
            }
          : item,
      ),
    );
  } else {
    writeGuestCartItems([
      ...items,
      {
        id: itemId,
        product_id: input.productId,
        quantity: quantityToAdd,
        unit_price_cents: input.unitPriceCents,
        delivery_type: delivery.type,
        delivery_cents: delivery.priceCents,
        currency: input.currency,
        selected_color: selectedColor,
        selected_length: selectedLength,
        selected_material: selectedMaterial,
        selected_options: selectedOptions,
        variant_key: variantKey,
        product_snapshot: {
          sku: input.sku,
          slug: input.slug,
          name: input.name,
          image_url: input.imageUrl,
          delivery_type: delivery.type,
          delivery_cents: delivery.priceCents,
          selected_color: selectedColor,
          selected_length: selectedLength,
          selected_material: selectedMaterial,
          selected_options: selectedOptionLabels,
        },
      },
    ]);
  }

  emitCartUpdated();
}

export async function getCurrentUserId(supabase: SupabaseClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return session.user.id;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function getOrCreateActiveCart(
  supabase: SupabaseClient,
  userId: string,
  currency = "EUR",
) {
  let existingCart: CartRow | null = null;
  let existingError: Error | null = null;

  const withDiscount = await supabase
    .from("carts")
    .select("id, user_id, currency, discount_cents")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (withDiscount.error) {
    const fallback = await supabase
      .from("carts")
      .select("id, user_id, currency")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    existingCart = fallback.data ? ({ ...fallback.data, discount_cents: 0 } as CartRow) : null;
    existingError = fallback.error;
  } else {
    existingCart = withDiscount.data as CartRow | null;
  }

  if (existingError) throw existingError;
  if (existingCart) return existingCart as CartRow;

  const createWithDiscount = await supabase
    .from("carts")
    .insert({
      user_id: userId,
      status: "active",
      currency,
      discount_cents: 0,
    })
    .select("id, user_id, currency, discount_cents")
    .single();

  if (!createWithDiscount.error) {
    return createWithDiscount.data as CartRow;
  }

  const createFallback = await supabase
    .from("carts")
    .insert({
      user_id: userId,
      status: "active",
      currency,
    })
    .select("id, user_id, currency")
    .single();

  const createdCart = createFallback.data
    ? ({ ...createFallback.data, discount_cents: 0 } as CartRow)
    : null;
  const createError = createFallback.error;

  if (createError) throw createError;
  return createdCart as CartRow;
}

export async function getActiveCartCount(
  supabase: SupabaseClient,
  userId: string,
) {
  const cart = await getOrCreateActiveCart(supabase, userId);
  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id);

  if (error) throw error;
  return ((data as Array<{ quantity: number }> | null) ?? []).reduce(
    (total, item) => total + item.quantity,
    0,
  );
}

export async function addProductToCart(
  supabase: SupabaseClient,
  userId: string | null,
  input: AddToCartInput,
) {
  if (!userId) {
    addProductToGuestCart(input);
    return;
  }

  const cart = await getOrCreateActiveCart(supabase, userId, input.currency || "EUR");
  const quantityToAdd = Math.max(1, input.quantity ?? 1);
  const selectedColor = input.selectedColor?.trim() || null;
  const selectedLength = input.selectedLength?.trim() || null;
  const selectedMaterial = input.selectedMaterial?.trim() || null;
  const selectedOptions = normalizeSelectedOptionsMap(input.selectedOptions);
  const selectedOptionLabels = normalizeSelectedOptionsMap(input.selectedOptionLabels);
  const variantKey = createVariantKey(selectedOptions);
  const delivery = getDeliveryOption(normalizeDeliveryType(input.deliveryType));

  const existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", input.productId)
    .eq("variant_key", variantKey);

  const { data: existingItem, error: existingError } = await existingQuery.maybeSingle();

  if (existingError) throw existingError;

  if (existingItem) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantityToAdd,
        unit_price_cents: input.unitPriceCents,
        delivery_type: delivery.type,
        delivery_cents: delivery.priceCents,
        currency: input.currency,
        selected_color: selectedColor,
        selected_length: selectedLength,
        selected_material: selectedMaterial,
        selected_options: selectedOptions,
        variant_key: variantKey,
        product_snapshot: {
          sku: input.sku,
          slug: input.slug,
          name: input.name,
          image_url: input.imageUrl,
          delivery_type: delivery.type,
          delivery_cents: delivery.priceCents,
          selected_color: selectedColor,
          selected_length: selectedLength,
          selected_material: selectedMaterial,
          selected_options: selectedOptionLabels,
        },
      })
      .eq("id", existingItem.id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_id: input.productId,
      quantity: quantityToAdd,
      unit_price_cents: input.unitPriceCents,
      delivery_type: delivery.type,
      delivery_cents: delivery.priceCents,
      currency: input.currency,
      selected_color: selectedColor,
      selected_length: selectedLength,
      selected_material: selectedMaterial,
      selected_options: selectedOptions,
      variant_key: variantKey,
      product_snapshot: {
        sku: input.sku,
        slug: input.slug,
        name: input.name,
        image_url: input.imageUrl,
        delivery_type: delivery.type,
        delivery_cents: delivery.priceCents,
        selected_color: selectedColor,
        selected_length: selectedLength,
        selected_material: selectedMaterial,
        selected_options: selectedOptionLabels,
      },
    });

    if (insertError) throw insertError;
  }

  emitCartUpdated();
}
