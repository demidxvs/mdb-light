import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";
import type { InvoiceFormState, InvoiceLineDraft } from "@/lib/invoices";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ProductRow = {
  id: string;
  sku: string;
  currency: string;
  price_cents: number;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
  }>;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  client_name: string;
  pdf_path: string | null;
  pdf_generated_at: string | null;
};

type SaveInvoiceBody = {
  currentInvoiceId?: string | null;
  form?: InvoiceFormState;
  lines?: InvoiceLineDraft[];
  locale?: LocaleKey;
};

type PatchInvoiceBody = {
  id?: string;
  pdfPath?: string | null;
  pdfGeneratedAt?: string | null;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveProductName(product: ProductRow, locale: LocaleKey) {
  const translation =
    product.product_translations?.find((item) => item.locale === locale) ||
    product.product_translations?.find((item) => item.locale === "en") ||
    product.product_translations?.[0];

  return translation?.name || product.sku;
}

export async function GET(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const locale = (new URL(request.url).searchParams.get("locale") || "en") as LocaleKey;
    const storefront = createStorefrontServiceClient();
    const [{ data: productRows, error: productError }, { data: invoiceRows, error: invoiceError }] =
      await Promise.all([
        storefront
          .from("products")
          .select("id, sku, currency, price_cents, product_translations(locale, name)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        storefront
          .from("invoices")
          .select("id, invoice_number, issue_date, status, client_name, pdf_path, pdf_generated_at")
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    return NextResponse.json({
      products: ((productRows as ProductRow[] | null) ?? []).map((product) => ({
        id: product.id,
        sku: product.sku,
        currency: product.currency,
        priceCents: product.price_cents,
        name: resolveProductName(product, locale),
      })),
      recentInvoices: (invoiceRows as InvoiceRow[] | null) ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load invoice builder" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as SaveInvoiceBody;
    const form = body.form;
    const lines = body.lines ?? [];
    const currentInvoiceId = normalizeText(body.currentInvoiceId);

    if (!form || !form.clientName.trim() || !form.clientAddress.trim() || lines.length === 0) {
      return NextResponse.json({ error: "Invalid invoice payload" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const invoicePayload = {
      invoice_number: form.invoiceNumber.trim(),
      issue_date: form.issueDate,
      status: form.status,
      client_name: form.clientName.trim(),
      client_registration_number: form.clientRegistrationNumber.trim() || null,
      client_address: form.clientAddress.trim(),
      client_email: form.clientEmail.trim() || null,
      client_phone: form.clientPhone.trim() || null,
      amount_in_words: form.amountInWords.trim() || null,
      advance_payment_cents: form.advancePaymentCents,
      note: form.note.trim() || null,
    };

    let invoiceId = currentInvoiceId;

    if (invoiceId) {
      const { error: updateError } = await storefront
        .from("invoices")
        .update(invoicePayload)
        .eq("id", invoiceId);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      const { error: deleteError } = await storefront
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId);
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    } else {
      const { data: inserted, error: insertError } = await storefront
        .from("invoices")
        .insert(invoicePayload)
        .select("id")
        .single();

      if (insertError || !inserted) {
        return NextResponse.json({ error: insertError?.message || "Failed to create invoice" }, { status: 500 });
      }

      invoiceId = inserted.id;
    }

    const lineRows = lines.map((line, index) => ({
      invoice_id: invoiceId,
      product_id: line.productId,
      position: index + 1,
      name: line.name.trim(),
      sku: line.sku.trim() || null,
      unit: line.unit.trim() || "gab",
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
      total_price_cents: line.quantity * line.unitPriceCents,
      note: line.note.trim() || null,
    }));

    const { error: lineError } = await storefront.from("invoice_items").insert(lineRows);
    if (lineError) {
      return NextResponse.json({ error: lineError.message }, { status: 500 });
    }

    return NextResponse.json({ invoiceId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save invoice" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as PatchInvoiceBody;
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: "Invoice id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront
      .from("invoices")
      .update({
        pdf_path: body.pdfPath ?? null,
        pdf_generated_at: body.pdfGeneratedAt ?? null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update invoice" },
      { status: 500 },
    );
  }
}
