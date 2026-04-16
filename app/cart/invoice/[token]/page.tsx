import { InvoiceCartImportClient } from "@/components/ui/invoice-cart-import-client";

export default async function InvoiceCartImportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InvoiceCartImportClient token={token} />;
}
