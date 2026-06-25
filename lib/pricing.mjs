export const DELIVERY_TYPES = ["parcel_locker", "home_delivery"];

export const DELIVERY_OPTIONS = {
  parcel_locker: {
    type: "parcel_locker",
    priceCents: 300,
  },
  home_delivery: {
    type: "home_delivery",
    priceCents: 1500,
  },
};

export function normalizeDeliveryType(value) {
  return value === "home_delivery" ? "home_delivery" : "parcel_locker";
}

export function getDeliveryOption(value) {
  return DELIVERY_OPTIONS[normalizeDeliveryType(value)];
}

export function normalizePromoCode(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function normalizeDiscountPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
}

export function resolveOrderDelivery(items) {
  const hasHomeDelivery = items.some(
    (item) => normalizeDeliveryType(item.delivery_type ?? item.deliveryType) === "home_delivery",
  );

  return getDeliveryOption(hasHomeDelivery ? "home_delivery" : "parcel_locker");
}

export function calculatePricing({ items, discountPercent = 0 }) {
  const normalizedItems = Array.isArray(items) ? items : [];
  const subtotalCents = normalizedItems.reduce((sum, item) => {
    const quantity = Math.max(0, Math.trunc(Number(item.quantity) || 0));
    const unitPriceCents = Math.max(0, Math.round(Number(item.unit_price_cents ?? item.unitPriceCents) || 0));
    return sum + unitPriceCents * quantity;
  }, 0);
  const delivery = normalizedItems.length > 0
    ? resolveOrderDelivery(normalizedItems)
    : getDeliveryOption("parcel_locker");
  const normalizedDiscountPercent = normalizeDiscountPercent(discountPercent);
  const discountCents = Math.min(
    subtotalCents,
    Math.round(subtotalCents * (normalizedDiscountPercent / 100)),
  );

  return {
    subtotalCents,
    discountCents,
    shippingCents: delivery.priceCents,
    deliveryType: delivery.type,
    totalCents: Math.max(subtotalCents - discountCents, 0) + delivery.priceCents,
    discountPercent: normalizedDiscountPercent,
  };
}
