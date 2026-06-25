import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePricing,
  normalizePromoCode,
  resolveOrderDelivery,
} from "../lib/pricing.mjs";

describe("pricing", () => {
  it("uses parcel locker delivery for parcel-only carts", () => {
    const delivery = resolveOrderDelivery([
      { quantity: 1, unit_price_cents: 1000, delivery_type: "parcel_locker" },
    ]);

    assert.equal(delivery.type, "parcel_locker");
    assert.equal(delivery.priceCents, 300);
  });

  it("uses home delivery when any cart item requires home delivery", () => {
    const delivery = resolveOrderDelivery([
      { quantity: 1, unit_price_cents: 1000, delivery_type: "parcel_locker" },
      { quantity: 1, unit_price_cents: 2000, delivery_type: "home_delivery" },
    ]);

    assert.equal(delivery.type, "home_delivery");
    assert.equal(delivery.priceCents, 1500);
  });

  it("applies promo discounts only to product subtotal", () => {
    const pricing = calculatePricing({
      discountPercent: 50,
      items: [
        { quantity: 2, unit_price_cents: 5000, delivery_type: "home_delivery" },
      ],
    });

    assert.equal(pricing.subtotalCents, 10000);
    assert.equal(pricing.discountCents, 5000);
    assert.equal(pricing.shippingCents, 1500);
    assert.equal(pricing.totalCents, 6500);
  });

  it("normalizes promo codes", () => {
    assert.equal(normalizePromoCode(" summer 50 "), "SUMMER50");
  });
});
