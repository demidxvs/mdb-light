import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getLegalMetadata, getRequestLocale } from "@/lib/legal-metadata";

export async function generateMetadata() {
  return getLegalMetadata("privacy");
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();

  return <LegalPageShell locale={locale} page="privacy" />;
}
