import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getLegalMetadata, getRequestLocale } from "@/lib/legal-metadata";

export async function generateMetadata() {
  return getLegalMetadata("terms");
}

export default async function TermsPage() {
  const locale = await getRequestLocale();

  return <LegalPageShell locale={locale} page="terms" />;
}
