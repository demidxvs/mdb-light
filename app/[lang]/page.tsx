import Home from "@/app/page";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import { getCommonStructuredData } from "@/lib/seo";
import { getHomeMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  return getHomeMetadata(locale);
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const alternates = {
    en: "/en",
    ru: "/ru",
    lv: "/lv",
    el: "/el",
  };
  const structuredData = getCommonStructuredData(locale);

  return (
    <>
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script key={`home-schema-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <Home />
    </>
  );
}
