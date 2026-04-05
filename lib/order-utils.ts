import type { Locale } from "@/i18n/config";
import { INVOICE_SUPPLIER_DEFAULTS } from "@/lib/invoices";

export type OrderPaymentMethod = "stripe" | "bank_transfer";

export function buildOrderCode(orderNumber: number) {
  return `MDB-${String(orderNumber).padStart(6, "0")}`;
}

export function formatOrderMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format((cents || 0) / 100);
}

export function getPaymentMethodLabel(locale: Locale, paymentMethod: OrderPaymentMethod) {
  const copy = {
    en: {
      stripe: "Card payment",
      bank_transfer: "Bank transfer",
    },
    ru: {
      stripe: "Оплата картой",
      bank_transfer: "Оплата переводом",
    },
    el: {
      stripe: "Πληρωμή με κάρτα",
      bank_transfer: "Τραπεζική μεταφορά",
    },
    lv: {
      stripe: "Apmaksa ar karti",
      bank_transfer: "Bankas pārskaitījums",
    },
  } as const;

  return copy[locale][paymentMethod];
}

export function getDeliveryCopy(locale: Locale) {
  return {
    cartCheckout:
      locale === "ru"
        ? "После оформления заказа мы свяжемся с вами для уточнения доставки."
        : locale === "el"
          ? "Μετά την καταχώρηση της παραγγελίας σας, θα επικοινωνήσουμε μαζί σας για την παράδοση."
          : locale === "lv"
            ? "Pēc pasūtījuma veikšanas mēs ar jums sazināsimies, lai precizētu piegādi."
            : "After placing your order, we will contact you to confirm delivery details.",
    success:
      locale === "ru"
        ? "Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для уточнения доставки."
        : locale === "el"
          ? "Ευχαριστούμε για την παραγγελία σας! Θα επικοινωνήσουμε σύντομα μαζί σας για την παράδοση."
          : locale === "lv"
            ? "Paldies par jūsu pasūtījumu! Mēs drīzumā ar jums sazināsimies par piegādi."
            : "Thank you for your order! We will contact you shortly regarding delivery.",
    email:
      locale === "ru"
        ? "Мы свяжемся с вами для уточнения деталей доставки."
        : locale === "el"
          ? "Θα επικοινωνήσουμε μαζί σας για να επιβεβαιώσουμε τις λεπτομέρειες παράδοσης."
          : locale === "lv"
            ? "Mēs ar jums sazināsimies, lai precizētu piegādes informāciju."
            : "We will contact you to confirm delivery details.",
    bankTransfer:
      locale === "ru"
        ? "После поступления оплаты мы свяжемся с вами для уточнения доставки."
        : locale === "el"
          ? "Μετά την επιβεβαίωση της πληρωμής, θα επικοινωνήσουμε μαζί σας για την παράδοση."
          : locale === "lv"
            ? "Pēc maksājuma saņemšanas mēs ar jums sazināsimies par piegādi."
            : "After receiving the payment, we will contact you regarding delivery.",
  };
}

export function formatAddress(address: Record<string, unknown> | null | undefined) {
  if (!address || typeof address !== "object") return "";

  const parts = [
    typeof address.line1 === "string" ? address.line1 : "",
    typeof address.line2 === "string" ? address.line2 : "",
    typeof address.city === "string" ? address.city : "",
    typeof address.state === "string" ? address.state : "",
    typeof address.postal_code === "string" ? address.postal_code : "",
    typeof address.country === "string" ? address.country : "",
  ].filter(Boolean);

  return parts.join(", ");
}

export function getBankDetails() {
  return {
    company: INVOICE_SUPPLIER_DEFAULTS.name,
    iban: INVOICE_SUPPLIER_DEFAULTS.iban,
    bank: INVOICE_SUPPLIER_DEFAULTS.bank,
    swift: "HABALV22",
  };
}
