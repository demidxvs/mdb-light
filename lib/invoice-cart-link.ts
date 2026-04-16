import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_SEPARATOR = ".";

function getInvoiceCartSecret() {
  return (
    process.env.INVOICE_CART_LINK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

function signInvoiceId(invoiceId: string) {
  const secret = getInvoiceCartSecret();
  if (!secret) {
    throw new Error("Missing invoice cart link secret.");
  }

  return createHmac("sha256", secret).update(invoiceId).digest("hex");
}

export function createInvoiceCartToken(invoiceId: string) {
  const normalizedId = invoiceId.trim();
  if (!normalizedId) {
    throw new Error("Invoice id is required.");
  }

  return `${normalizedId}${TOKEN_SEPARATOR}${signInvoiceId(normalizedId)}`;
}

export function verifyInvoiceCartToken(token: string) {
  const normalizedToken = token.trim();
  const separatorIndex = normalizedToken.indexOf(TOKEN_SEPARATOR);

  if (separatorIndex <= 0) {
    return null;
  }

  const invoiceId = normalizedToken.slice(0, separatorIndex);
  const signature = normalizedToken.slice(separatorIndex + 1);

  if (!invoiceId || !signature) {
    return null;
  }

  const expectedSignature = signInvoiceId(invoiceId);
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  return invoiceId;
}
