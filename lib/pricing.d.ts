export type DeliveryType = "parcel_locker" | "home_delivery";

export type PricingItem = {
  quantity: number;
  unit_price_cents?: number;
  unitPriceCents?: number;
  delivery_type?: string | null;
  deliveryType?: string | null;
};

export declare const DELIVERY_TYPES: DeliveryType[];
export declare const DELIVERY_OPTIONS: Record<DeliveryType, { type: DeliveryType; priceCents: number }>;
export declare function normalizeDeliveryType(value: unknown): DeliveryType;
export declare function getDeliveryOption(value: unknown): { type: DeliveryType; priceCents: number };
export declare function normalizePromoCode(value: unknown): string;
export declare function normalizeDiscountPercent(value: unknown): number;
export declare function resolveOrderDelivery(items: PricingItem[]): { type: DeliveryType; priceCents: number };
export declare function calculatePricing(input: {
  items: PricingItem[];
  discountPercent?: number;
}): {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  deliveryType: DeliveryType;
  totalCents: number;
  discountPercent: number;
};
