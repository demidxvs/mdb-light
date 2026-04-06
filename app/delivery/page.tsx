import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getLegalMetadata, getRequestLocale } from "@/lib/legal-metadata";

export async function generateMetadata() {
  return getLegalMetadata("delivery");
}

export default async function DeliveryPage() {
  const locale = await getRequestLocale();

  return <LegalPageShell locale={locale} page="delivery" />;
}
