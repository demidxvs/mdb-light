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
        ? "После оплаты мы свяжемся с вами для подтверждения деталей заказа."
        : locale === "el"
          ? "Μετά την πληρωμή θα επικοινωνήσουμε μαζί σας για να επιβεβαιώσουμε τις λεπτομέρειες της παραγγελίας."
          : locale === "lv"
            ? "Pēc apmaksas mēs ar jums sazināsimies, lai apstiprinātu pasūtījuma detaļas."
            : "After the payment, we will contact you to confirm the order details.",
    success:
      locale === "ru"
        ? "Спасибо за ваш заказ! После оплаты мы свяжемся с вами в ближайшее время."
        : locale === "el"
          ? "Ευχαριστούμε για την παραγγελία σας! Μετά την πληρωμή θα επικοινωνήσουμε σύντομα μαζί σας."
          : locale === "lv"
            ? "Paldies par jūsu pasūtījumu! Pēc apmaksas mēs drīzumā ar jums sazināsimies."
            : "Thank you for your order! We will contact you shortly after the payment.",
    email:
      locale === "ru"
        ? "После оплаты мы свяжемся с вами для подтверждения деталей заказа."
        : locale === "el"
          ? "Μετά την πληρωμή θα επικοινωνήσουμε μαζί σας για να επιβεβαιώσουμε τις λεπτομέρειες της παραγγελίας."
          : locale === "lv"
            ? "Pēc apmaksas mēs ar jums sazināsimies, lai apstiprinātu pasūtījuma detaļas."
            : "After the payment, we will contact you to confirm the order details.",
    bankTransfer:
      locale === "ru"
        ? "После поступления оплаты мы свяжемся с вами для подтверждения деталей заказа."
        : locale === "el"
          ? "Μετά την επιβεβαίωση της πληρωμής θα επικοινωνήσουμε μαζί σας για να επιβεβαιώσουμε τις λεπτομέρειες της παραγγελίας."
          : locale === "lv"
            ? "Pēc maksājuma saņemšanas mēs ar jums sazināsimies, lai apstiprinātu pasūtījuma detaļas."
            : "After receiving the payment, we will contact you to confirm the order details.",
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
