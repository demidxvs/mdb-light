import { NextResponse } from "next/server";
import { createStorefrontServiceClient, requireAdminUser } from "@/lib/storefront-admin-server";
import { createInvoiceCartToken } from "@/lib/invoice-cart-link";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as { invoiceId?: string; locale?: string };
    const invoiceId = normalizeText(body.invoiceId);
    const locale = normalizeText(body.locale) || "en";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data: invoice, error } = await storefront
      .from("invoices")
      .select("id")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const token = createInvoiceCartToken(invoiceId);
    const cartUrl = `${siteUrl}/${locale}/cart/invoice/${encodeURIComponent(token)}`;

    return NextResponse.json({ token, cartUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create cart link." },
      { status: 500 },
    );
  }
}
