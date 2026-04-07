import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";
import {
  getCategorySlugCandidates,
  getLocalizedCategorySlug,
  getProductSlugCandidates,
  type SeoCategory,
  type SeoProduct,
} from "@/lib/seo";

export type StorefrontCategory = SeoCategory;
export type StorefrontProduct = SeoProduct & {
  category_id: string | null;
  categories?: StorefrontCategory | null;
};

export const getActiveCategories = cache(async () => {
  const storefront = createStorefrontServiceClient();
  const categoriesQuery = await storefront
    .from("categories")
    .select("id, slug, cover_image_url, sort_order, category_translations(locale, name, slug, description)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  let data: StorefrontCategory[] | null = (categoriesQuery.data as StorefrontCategory[] | null) ?? null;
  let error = categoriesQuery.error;

  if (error?.message.includes("slug does not exist")) {
    const fallback = await storefront
      .from("categories")
      .select("id, slug, cover_image_url, sort_order, category_translations(locale, name, description)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    data = (fallback.data as StorefrontCategory[] | null) ?? null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StorefrontCategory[];
});

export const getActiveProducts = cache(async () => {
  const storefront = createStorefrontServiceClient();
  const productsQuery = await storefront
    .from("products")
    .select(
      "id, sku, slug, sort_order, category_id, price_cents, currency, primary_image_url, image_urls, product_translations(locale, name, slug, short_description, description), categories(id, slug, cover_image_url, category_translations(locale, name, slug, description))",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  let data = productsQuery.data;
  let error = productsQuery.error;

  if (error?.message.includes("slug does not exist") || error?.message.includes("sort_order does not exist")) {
    const fallback = await storefront
      .from("products")
      .select(
        "id, sku, slug, category_id, price_cents, currency, primary_image_url, image_urls, product_translations(locale, name, short_description, description), categories(id, slug, cover_image_url, category_translations(locale, name, description))",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<
    Omit<StorefrontProduct, "categories"> & {
      categories?: StorefrontCategory[] | StorefrontCategory | null;
    }
  >).map((item) => ({
    ...item,
    categories: Array.isArray(item.categories) ? item.categories[0] ?? null : item.categories ?? null,
  }));
});

export async function getCategoryByLocalizedSlug(locale: Locale, categorySlug: string) {
  const categories = await getActiveCategories();
  return (
    categories.find((item) => {
      const normalized = categorySlug.trim().toLowerCase();
      return (
        getLocalizedCategorySlug(item, locale) === normalized ||
        getCategorySlugCandidates(item).includes(normalized)
      );
    }) || null
  );
}

export async function getProductsByCategoryId(categoryId: string) {
  const products = await getActiveProducts();
  return products.filter((item) => item.category_id === categoryId);
}

export async function getProductByLocalizedSlugs(
  locale: Locale,
  categorySlug: string,
  productSlug: string,
) {
  const category = await getCategoryByLocalizedSlug(locale, categorySlug);
  const normalizedProductSlug = productSlug.trim().toLowerCase();

  if (category?.id) {
    const products = await getProductsByCategoryId(category.id);
    const product =
      products.find((item) => getProductSlugCandidates(item).includes(normalizedProductSlug)) || null;

    if (product) {
      return { category, product };
    }
  }

  const allProducts = await getActiveProducts();
  const fallbackProduct =
    allProducts.find((item) => getProductSlugCandidates(item).includes(normalizedProductSlug)) || null;

  if (!fallbackProduct) {
    return { category: null, product: null };
  }

  const fallbackCategory =
    fallbackProduct.categories ||
    (fallbackProduct.category_id
      ? (await getActiveCategories()).find((item) => item.id === fallbackProduct.category_id) || null
      : null);

  return { category: fallbackCategory, product: fallbackProduct };
}
