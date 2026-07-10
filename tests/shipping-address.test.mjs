import assert from "node:assert/strict";
import test from "node:test";
import {
  formatShippingAddress,
  normalizeShippingAddress,
  validateShippingAddress,
} from "../lib/shipping-address.mjs";

test("normalizes whitespace in a shipping address", () => {
  assert.deepEqual(
    normalizeShippingAddress({
      line1: "  Brivibas   iela 10 ",
      line2: "  Apartment 5 ",
      city: " Riga ",
      postal_code: " LV-1010 ",
      country: " Latvia ",
    }),
    {
      line1: "Brivibas iela 10",
      line2: "Apartment 5",
      city: "Riga",
      postal_code: "LV-1010",
      country: "Latvia",
    },
  );
});

test("requires the delivery address fields used by checkout", () => {
  const result = validateShippingAddress({
    line1: "Brivibas iela 10",
    city: "Riga",
    postal_code: "",
    country: "Latvia",
  });

  assert.equal(result.valid, false);
  assert.equal(result.error, "missing");
});

test("formats an address for admin and invoice output", () => {
  assert.equal(
    formatShippingAddress({
      line1: "Brivibas iela 10",
      line2: "Apartment 5",
      city: "Riga",
      postal_code: "LV-1010",
      country: "Latvia",
    }),
    "Brivibas iela 10, Apartment 5, Riga, LV-1010, Latvia",
  );
});
