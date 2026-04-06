import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getLegalMetadata, getRequestLocale } from "@/lib/legal-metadata";

export async function generateMetadata() {
  return getLegalMetadata("cookies");
}

export default async function CookiesPage() {
  const locale = await getRequestLocale();

  return <LegalPageShell locale={locale} page="cookies" />;
}
