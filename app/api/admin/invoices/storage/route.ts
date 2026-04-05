import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

const INVOICE_PDF_BUCKET = "invoice-pdfs";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const path = normalizeText(new URL(request.url).searchParams.get("path"));
    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront.storage
      .from(INVOICE_PDF_BUCKET)
      .createSignedUrl(path, 60);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create signed URL" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const formData = await request.formData();
    const invoiceId = normalizeText(formData.get("invoiceId"));
    const file = formData.get("file");

    if (!invoiceId || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Invoice id and file are required" }, { status: 400 });
    }

    const path = `invoices/${invoiceId}/invoice.pdf`;
    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.storage
      .from(INVOICE_PDF_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ path });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload PDF" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as { path?: string };
    const path = normalizeText(body.path);
    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.storage.from(INVOICE_PDF_BUCKET).remove([path]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete PDF" },
      { status: 500 },
    );
  }
}
