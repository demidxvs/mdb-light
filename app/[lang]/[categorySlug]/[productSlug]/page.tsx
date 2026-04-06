import { notFound } from "next/navigation";
import ProductPage from "@/app/products/[slug]/page";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import { getProductByLocalizedSlugs } from "@/lib/storefront-seo";
import {
  buildProductPath,
  getCommonStructuredData,
  getProductMetadata,
  getProductTranslation,
  getSiteName,
} from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string; productSlug: string }>;
}) {
  const { lang, categorySlug, productSlug } = await params;
  if (!isLocale(lang)) return {};
  const { category, product } = await getProductByLocalizedSlugs(lang, categorySlug, productSlug);
  if (!category || !product) return {};
  return getProductMetadata(lang, category, product);
}

export default async function SeoProductPage({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string; productSlug: string }>;
}) {
  const { lang, categorySlug, productSlug } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const { category, product } = await getProductByLocalizedSlugs(locale, categorySlug, productSlug);
  if (!category || !product) notFound();
  const translation = getProductTranslation(product, locale);
  const alternates = {
    en: buildProductPath("en", category, product),
    ru: buildProductPath("ru", category, product),
    lv: buildProductPath("lv", category, product),
    el: buildProductPath("el", category, product),
  };
  const structuredData = [
    ...getCommonStructuredData(locale),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: getSiteName(), item: `/${locale}` },
        { "@type": "ListItem", position: 2, name: category.slug, item: `/${locale}/${categorySlug}` },
        { "@type": "ListItem", position: 3, name: product.slug, item: alternates[locale] },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: translation?.name || product.sku || product.slug,
      sku: product.sku,
      category: category.slug,
      description: translation?.short_description || product.slug,
      image: [product.primary_image_url || product.image_urls?.[0]].filter(Boolean),
      offers: {
        "@type": "Offer",
        priceCurrency: product.currency || "EUR",
        price: (product.price_cents / 100).toFixed(2),
        availability: "https://schema.org/InStock",
      },
    },
  ];

  return (
    <>
      <SeoLocaleAlternatesBridge alternates={alternates} />
      {structuredData.map((item, index) => (
        <script
          key={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <ProductPage params={Promise.resolve({ slug: product.slug })} />
    </>
  );
}
