import { NextResponse } from "next/server";
import { generateInvoicePdf, type InvoicePdfPayload } from "@/lib/invoice-pdf";
import { requireAdminUser } from "@/lib/storefront-admin-server";

export async function POST(request: Request) {
  try {
    const { response } = await requireAdminUser();
    if (response) return response;

    const body = (await request.json()) as InvoicePdfPayload;

    if (!body.invoiceNumber || !body.issueDate || !body.clientName || !body.clientAddress || !body.items?.length) {
      return NextResponse.json({ error: "Invalid invoice payload" }, { status: 400 });
    }

    const { bytes, fileName } = await generateInvoicePdf(body);

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation failed", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
