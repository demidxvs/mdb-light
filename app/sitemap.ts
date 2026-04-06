import type { MetadataRoute } from "next";
import { blogArticles } from "@/lib/blog";
import { locationLandings, serviceLandings } from "@/lib/seo-content";
import { getActiveCategories, getActiveProducts } from "@/lib/storefront-seo";
import { buildCategoryPath, buildProductPath, getSiteUrl, type SeoCategory } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

const locales: Locale[] = ["en", "ru", "lv", "el"];

function buildAlternatesForPath(pathBuilder: (locale: Locale) => string) {
  return {
    languages: {
      en: pathBuilder("en"),
      ru: pathBuilder("ru"),
      lv: pathBuilder("lv"),
      el: pathBuilder("el"),
      "x-default": pathBuilder("en"),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getActiveCategories(), getActiveProducts()]);
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const now = new Date();
  const siteUrl = getSiteUrl();

  const homeEntries = locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: buildAlternatesForPath((targetLocale) => `${siteUrl}/${targetLocale}`),
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${siteUrl}${buildCategoryPath("en", category)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: buildAlternatesForPath((locale) => `${siteUrl}${buildCategoryPath(locale, category)}`),
    images: category.cover_image_url ? [category.cover_image_url] : undefined,
  }));

  const productEntries = products
    .filter((product) => product.category_id && categoryById.has(product.category_id))
    .map((product) => {
      const category = categoryById.get(product.category_id!) as SeoCategory;
      return {
        url: `${siteUrl}${buildProductPath("en", category, product)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: buildAlternatesForPath((locale) => `${siteUrl}${buildProductPath(locale, category, product)}`),
        images: product.primary_image_url ? [product.primary_image_url] : undefined,
      };
    });

  const blogIndexEntries = locales.map((locale) => ({
    url: `${siteUrl}/${locale}/blog`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
    alternates: buildAlternatesForPath((targetLocale) => `${siteUrl}/${targetLocale}/blog`),
  }));

  const blogArticleEntries = blogArticles.map((article) => ({
    url: `${siteUrl}/en/blog/${article.slug.en}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
    alternates: buildAlternatesForPath((locale) => `${siteUrl}/${locale}/blog/${article.slug[locale]}`),
  }));

  const serviceEntries = Object.values(serviceLandings).map((landing) => ({
    url: `${siteUrl}/en/services/${landing.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
    alternates: buildAlternatesForPath((locale) => `${siteUrl}/${locale}/services/${landing.slug}`),
  }));

  const locationEntries = Object.values(locationLandings).map((landing) => ({
    url: `${siteUrl}/en/locations/${landing.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.74,
    alternates: buildAlternatesForPath((locale) => `${siteUrl}/${locale}/locations/${landing.slug}`),
  }));

  return [
    ...homeEntries,
    ...categoryEntries,
    ...productEntries,
    ...blogIndexEntries,
    ...blogArticleEntries,
    ...serviceEntries,
    ...locationEntries,
  ];
}
