import { notFound } from "next/navigation";
import CategoryPage from "@/app/catalog/[slug]/page";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import { getCategoryByLocalizedSlug } from "@/lib/storefront-seo";
import {
  buildCategoryPath,
  getCategoryMetadata,
  getCommonStructuredData,
  getSiteName,
} from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string }>;
}) {
  const { lang, categorySlug } = await params;
  if (!isLocale(lang)) return {};
  const category = await getCategoryByLocalizedSlug(lang, categorySlug);
  if (!category) return {};
  return getCategoryMetadata(lang, category);
}

export default async function SeoCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string }>;
}) {
  const { lang, categorySlug } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const category = await getCategoryByLocalizedSlug(locale, categorySlug);
  if (!category) notFound();
  const alternates = {
    en: buildCategoryPath("en", category),
    ru: buildCategoryPath("ru", category),
    lv: buildCategoryPath("lv", category),
    el: buildCategoryPath("el", category),
  };
  const structuredData = [
    ...getCommonStructuredData(locale),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: getSiteName(), item: `/${locale}` },
        { "@type": "ListItem", position: 2, name: category.slug, item: alternates[locale] },
      ],
    },
  ];

  return (
    <>
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script
          key={`category-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <CategoryPage params={Promise.resolve({ slug: category.slug })} />
    </>
  );
}
