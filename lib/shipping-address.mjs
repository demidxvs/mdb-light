const ADDRESS_LIMITS = {
  line1: 160,
  line2: 160,
  city: 100,
  postal_code: 20,
  country: 100,
};

function normalizeText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function normalizeShippingAddress(value) {
  const address = value && typeof value === "object" ? value : {};

  return {
    line1: normalizeText(address.line1),
    line2: normalizeText(address.line2),
    city: normalizeText(address.city),
    postal_code: normalizeText(address.postal_code),
    country: normalizeText(address.country),
  };
}

export function validateShippingAddress(value) {
  const address = normalizeShippingAddress(value);
  const requiredFields = ["line1", "city", "postal_code", "country"];

  if (requiredFields.some((field) => !address[field])) {
    return { valid: false, error: "missing", address };
  }

  const hasOversizedField = Object.entries(ADDRESS_LIMITS).some(
    ([field, maxLength]) => address[field].length > maxLength,
  );

  if (hasOversizedField) {
    return { valid: false, error: "too_long", address };
  }

  return { valid: true, error: null, address };
}

export function formatShippingAddress(value) {
  const address = normalizeShippingAddress(value);
  return [address.line1, address.line2, address.city, address.postal_code, address.country]
    .filter(Boolean)
    .join(", ");
}
