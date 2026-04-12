import Home from "@/app/page";
import { SeoLocaleAlternatesBridge } from "@/components/seo/seo-locale-alternates-bridge";
import type { HomeCategoryRow } from "@/components/ui/home-categories";
import type { HomeFeaturedProductRow } from "@/components/ui/home-featured-catalog";
import { getCommonStructuredData } from "@/lib/seo";
import { getHomeMetadata } from "@/lib/seo";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";
import { isLocale, type Locale } from "@/i18n/config";

type HomeProjectItem = {
  id: string;
  slug: string;
  imageUrl: string | null;
  featuredOnHome: boolean;
  palette: string;
  title: { en: string; ru: string; el: string; lv: string };
  caption: { en: string; ru: string; el: string; lv: string };
};

const fallbackPalettes = [
  "bg-[radial-gradient(circle_at_top,rgba(255,232,176,0.55),transparent_34%),linear-gradient(135deg,#26314f_0%,#475a82_42%,#f2d093_100%)]",
  "bg-[radial-gradient(circle_at_80%_20%,rgba(255,245,212,0.45),transparent_30%),linear-gradient(135deg,#17233b_0%,#314566_45%,#d7b87b_100%)]",
  "bg-[radial-gradient(circle_at_50%_18%,rgba(255,214,140,0.48),transparent_26%),linear-gradient(135deg,#2a2230_0%,#554463_48%,#f2bc66_100%)]",
  "bg-[radial-gradient(circle_at_72%_24%,rgba(255,250,228,0.46),transparent_28%),linear-gradient(135deg,#1d293f_0%,#4c5b78_44%,#efe4c8_100%)]",
] as const;

async function getHomeInitialData() {
  const storefront = createStorefrontServiceClient();

  const [categoriesResponse, productsResponse, projectsResponse] = await Promise.all([
    storefront
      .from("categories")
      .select("id, slug, sort_order, cover_image_url, category_translations(locale, name, slug, description)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(32),
    storefront
      .from("products")
      .select(
        "id, slug, category_id, price_cents, currency, primary_image_url, sort_order, product_translations(locale, name, slug, short_description), categories(slug, category_translations(locale, name, slug))",
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(4),
    storefront
      .from("projects")
      .select("id, slug, cover_image_url, is_featured_home")
      .eq("is_active", true)
      .eq("is_featured_home", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const categories = ((categoriesResponse.data as HomeCategoryRow[] | null) ?? []);
  const products = ((productsResponse.data as HomeFeaturedProductRow[] | null) ?? []);
  const projectRows =
    ((projectsResponse.data as Array<{ id: string; slug: string; cover_image_url: string | null; is_featured_home: boolean }> | null) ?? []);

  const countRows = await storefront.from("products").select("category_id").eq("is_active", true);
  const categoryCounts: Record<string, number> = {};
  (((countRows.data as Array<{ category_id: string | null }> | null) ?? [])).forEach((row) => {
    if (!row.category_id) return;
    categoryCounts[row.category_id] = (categoryCounts[row.category_id] || 0) + 1;
  });

  const projects: HomeProjectItem[] = projectRows.map((item, index) => ({
    id: item.id,
    slug: item.slug,
    imageUrl: item.cover_image_url,
    featuredOnHome: item.is_featured_home,
    palette: fallbackPalettes[index % fallbackPalettes.length],
    title: { en: item.slug, ru: item.slug, lv: item.slug, el: item.slug },
    caption: { en: "", ru: "", lv: "", el: "" },
  }));

  return { categories, categoryCounts, products, projects };
}

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
  const initialData = await getHomeInitialData();
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
      <Home
        initialCategories={initialData.categories}
        initialCategoryCounts={initialData.categoryCounts}
        initialFeaturedProducts={initialData.products}
        initialProjects={initialData.projects}
      />
    </>
  );
}
