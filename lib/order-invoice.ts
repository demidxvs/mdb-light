import { INVOICE_PDF_BUCKET } from "@/lib/storage";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";

type OrderInvoiceItem = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  note?: string;
};

type CreateOrderInvoiceInput = {
  orderId: string;
  orderCode: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subtotalCents: number;
  totalCents: number;
  items: OrderInvoiceItem[];
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  pdf_path: string | null;
};

function buildClientAddress() {
  return "Delivery details to be confirmed separately";
}

export async function createOrderInvoice(input: CreateOrderInvoiceInput) {
  const storefront = createStorefrontServiceClient();
  const invoiceNumber = input.orderCode;
  const { data: existingInvoice } = await storefront
    .from("invoices")
    .select("id, invoice_number, pdf_path")
    .eq("order_id", input.orderId)
    .maybeSingle();

  let invoiceId = (existingInvoice as InvoiceRow | null)?.id ?? null;

  if (!invoiceId) {
    const { data: insertedInvoice, error: invoiceError } = await storefront
      .from("invoices")
      .insert({
        order_id: input.orderId,
        invoice_number: invoiceNumber,
        issue_date: input.createdAt.slice(0, 10),
        status: "sent",
        client_name: input.customerName || input.customerEmail || "MDB Light customer",
        client_registration_number: null,
        client_address: buildClientAddress(),
        client_email: input.customerEmail,
        client_phone: input.customerPhone,
        amount_in_words: null,
        advance_payment_cents: 0,
        note: `Order ${input.orderCode}`,
      })
      .select("id")
      .single();

    if (invoiceError || !insertedInvoice) {
      throw new Error(invoiceError?.message || "Failed to create invoice.");
    }

    invoiceId = insertedInvoice.id;
  }

  const { error: deleteLinesError } = await storefront
    .from("invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);

  if (deleteLinesError) {
    throw new Error(deleteLinesError.message);
  }

  const { error: lineError } = await storefront
    .from("invoice_items")
    .insert(
      input.items.map((item, index) => ({
        invoice_id: invoiceId,
        product_id: item.productId,
        position: index + 1,
        name: item.name,
        sku: item.sku,
        unit: "gab",
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        total_price_cents: item.totalPriceCents,
        note: item.note || null,
      })),
    );

  if (lineError) {
    throw new Error(lineError.message);
  }

  const payload = {
    invoiceNumber,
    issueDate: input.createdAt.slice(0, 10),
    clientName: input.customerName || input.customerEmail || "MDB Light customer",
    clientRegistrationNumber: "",
    clientAddress: buildClientAddress(),
    clientEmail: input.customerEmail || "",
    clientPhone: input.customerPhone || "",
    amountInWords: "",
    advancePaymentCents: 0,
    subtotalCents: input.subtotalCents,
    totalCents: input.totalCents,
    note: `Order ${input.orderCode}`,
    items: input.items.map((item) => ({
      name: item.name,
      unit: "gab",
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      totalPriceCents: item.totalPriceCents,
      note: item.note,
    })),
  };

  const { bytes, fileName } = await generateInvoicePdf(payload);
  const path = `invoices/${invoiceId}/invoice.pdf`;
  const uploadBuffer = Buffer.from(bytes);
  const { error: uploadError } = await storefront.storage
    .from(INVOICE_PDF_BUCKET)
    .upload(path, uploadBuffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: "application/pdf",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: invoiceUpdateError } = await storefront
    .from("invoices")
    .update({
      invoice_number: invoiceNumber,
      pdf_path: path,
      pdf_generated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (invoiceUpdateError) {
    throw new Error(invoiceUpdateError.message);
  }

  return {
    invoiceId,
    invoiceNumber,
    pdfPath: path,
    attachment: {
      filename: `${fileName}.pdf`,
      content: Buffer.from(bytes).toString("base64"),
      contentType: "application/pdf",
    },
  };
}

export async function markOrderInvoicePaid(orderId: string) {
  const storefront = createStorefrontServiceClient();
  const { error } = await storefront
    .from("invoices")
    .update({ status: "paid" })
    .eq("order_id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteOrderInvoice(orderId: string) {
  const storefront = createStorefrontServiceClient();
  const { data: invoice } = await storefront
    .from("invoices")
    .select("id, pdf_path")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!invoice) return;

  if (invoice.pdf_path) {
    await storefront.storage.from(INVOICE_PDF_BUCKET).remove([invoice.pdf_path]);
  }

  await storefront.from("invoice_items").delete().eq("invoice_id", invoice.id);
  await storefront.from("invoices").delete().eq("id", invoice.id);
}

export async function getOrderInvoiceAttachment(orderId: string) {
  const storefront = createStorefrontServiceClient();
  const { data: invoice, error } = await storefront
    .from("invoices")
    .select("id, invoice_number, pdf_path")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !invoice?.pdf_path) {
    return null;
  }

  const { data, error: downloadError } = await storefront.storage
    .from(INVOICE_PDF_BUCKET)
    .download(invoice.pdf_path);

  if (downloadError || !data) {
    return null;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    pdfPath: invoice.pdf_path,
    attachment: {
      filename: `${invoice.invoice_number || "invoice"}.pdf`,
      content: buffer.toString("base64"),
      contentType: "application/pdf",
    },
  };
}

export async function getInvoicesByOrderIds(orderIds: string[]) {
  if (orderIds.length === 0) {
    return new Map<string, { id: string; invoice_number: string; pdf_path: string | null; pdf_generated_at: string | null; status: string }>();
  }

  const storefront = createStorefrontServiceClient();
  const { data, error } = await storefront
    .from("invoices")
    .select("id, order_id, invoice_number, pdf_path, pdf_generated_at, status")
    .in("order_id", orderIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (((data as Array<{ id: string; order_id: string; invoice_number: string; pdf_path: string | null; pdf_generated_at: string | null; status: string }> | null) ?? []).map((invoice) => [
      invoice.order_id,
      {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        pdf_path: invoice.pdf_path,
        pdf_generated_at: invoice.pdf_generated_at,
        status: invoice.status,
      },
    ])),
  );
}
