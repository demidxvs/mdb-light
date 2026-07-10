import {
  formatShippingAddress as formatShippingAddressValue,
  normalizeShippingAddress as normalizeShippingAddressValue,
  validateShippingAddress as validateShippingAddressValue,
} from "@/lib/shipping-address.mjs";

export type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  postal_code: string;
  country: string;
};

export type ShippingAddressValidation =
  | { valid: true; error: null; address: ShippingAddress }
  | { valid: false; error: "missing" | "too_long"; address: ShippingAddress };

export const normalizeShippingAddress = normalizeShippingAddressValue as (
  value: unknown,
) => ShippingAddress;

export const validateShippingAddress = validateShippingAddressValue as (
  value: unknown,
) => ShippingAddressValidation;

export const formatShippingAddress = formatShippingAddressValue as (
  value: unknown,
) => string;
