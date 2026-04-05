export type InvoiceStatus = "draft" | "sent" | "paid";

export type InvoiceLineDraft = {
  id: string;
  productId: string | null;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPriceCents: number;
  note: string;
};

export type InvoiceFormState = {
  invoiceNumber: string;
  issueDate: string;
  status: InvoiceStatus;
  clientName: string;
  clientRegistrationNumber: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  amountInWords: string;
  advancePaymentCents: number;
  note: string;
};

export const INVOICE_SUPPLIER_DEFAULTS = {
  name: "MDB Group, SIA",
  registrationNumber: "40203701967",
  address: "Jurmala, Skolas iela 30 - 107, LV-2016",
  phone: "+371 24443333",
  email: "info@mdbgroup.lv",
  website: "mdbgroup.lv",
  iban: "LV12HABA0551063522870",
  bank: 'AS "Swedbank", Kods: HABALV22',
} as const;

export function formatInvoiceMoney(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatInvoiceDate(value: string) {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function decimalStringToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function centsToDecimalString(value: number) {
  return (value / 100).toFixed(2);
}

export function buildNextInvoiceNumber(invoiceNumbers: string[], issueDate: string) {
  const year = new Date(issueDate).getFullYear();
  const nextIndex =
    invoiceNumbers.reduce((max, current) => {
      const match = current.match(/^(\d+)_([0-9]{4})$/);
      if (!match) return max;
      const currentYear = Number(match[2]);
      if (currentYear !== year) return max;
      return Math.max(max, Number(match[1]));
    }, 0) + 1;

  return `${nextIndex}_${year}`;
}

export function sanitizeInvoiceFilename(invoiceNumber: string) {
  return invoiceNumber.replace(/[^a-zA-Z0-9_-]+/g, "-");
}
