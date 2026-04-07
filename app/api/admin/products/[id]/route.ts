import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";
import { ensureUniqueBaseSlug, ensureUniqueLocalizedSlugs } from "@/lib/admin-localized-slugs";
import { normalizeSlugInput } from "@/lib/localized-slugs";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ProductUpdatePayload = {
  categoryId?: string | null;
  sku?: string;
  slug?: string;
  sortOrder?: number;
  currency?: string;
  priceCents?: number;
  stockQuantity?: number;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  trackInventory?: boolean;
  translations?: Array<{
    locale: LocaleKey;
    name: string;
    slug?: string;
  }>;
  attributes?: Array<{
    attributeId: string;
    value: string;
    priceAdjustments?: Record<string, number>;
  }>;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const { id } = await context.params;
    const storefront = createStorefrontServiceClient();

    const [
      { data: categories },
      { data: attributes },
      { data: product, error: productError },
      { data: attributeValues },
    ] = await Promise.all([
      storefront
        .from("categories")
        .select("id, slug, category_translations(locale, name, slug)")
        .order("sort_order", { ascending: true }),
      storefront
        .from("attributes")
        .select("id, slug, name_ru, name_en, name_lv, name_el, value_type, option_values")
        .order("created_at", { ascending: true }),
      storefront
        .from("products")
        .select(
          "id, sku, slug, sort_order, category_id, currency, price_cents, stock_quantity, primary_image_url, image_urls, is_active, is_featured, track_inventory, product_translations(locale, name, slug)",
        )
        .eq("id", id)
        .maybeSingle(),
      storefront
        .from("product_attribute_values")
        .select("id, product_id, attribute_id, value, price_adjustments")
        .eq("product_id", id),
    ]);

    if (productError || !product) {
      return NextResponse.json(
        { error: productError?.message || "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      product,
      categories: categories ?? [],
      attributes: attributes ?? [],
      productAttributes: attributeValues ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load product" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as ProductUpdatePayload;
    const storefront = createStorefrontServiceClient();

    const translations =
      body.translations?.map((item) => ({
        locale: item.locale,
        name: normalizeText(item.name),
        slug: normalizeSlugInput(item.slug),
      })) ?? [];
    const imageUrls =
      body.imageUrls?.map((value) => normalizeText(value)).filter(Boolean) ?? [];
    const primaryImageUrl =
      normalizeText(body.primaryImageUrl) ||
      imageUrls[0] ||
      null;
    const attributes =
      body.attributes?.map((item) => ({
        attribute_id: normalizeText(item.attributeId),
        value: normalizeText(item.value),
        price_adjustments:
          Object.fromEntries(
            Object.entries(item.priceAdjustments ?? {})
              .filter(([key, value]) => normalizeText(key) && Number.isFinite(value))
              .map(([key, value]) => [normalizeText(key), Math.round(value)]),
          ) ?? {},
      }))?.filter((item) => item.attribute_id && item.value) ?? [];

    if (!normalizeText(body.sku)) {
      return NextResponse.json({ error: "Product SKU and slug are required" }, { status: 400 });
    }

    if (translations.length !== 4 || translations.some((item) => !item.name)) {
      return NextResponse.json(
        { error: "All product translations are required" },
        { status: 400 },
      );
    }

    const localizedSlugs = await ensureUniqueLocalizedSlugs(storefront, {
      entity: "product",
      currentId: id,
      names: {
        en: translations.find((item) => item.locale === "en")?.name || "",
        ru: translations.find((item) => item.locale === "ru")?.name || "",
        el: translations.find((item) => item.locale === "el")?.name || "",
        lv: translations.find((item) => item.locale === "lv")?.name || "",
      },
      slugs: {
        en: translations.find((item) => item.locale === "en")?.slug || "",
        ru: translations.find((item) => item.locale === "ru")?.slug || "",
        el: translations.find((item) => item.locale === "el")?.slug || "",
        lv: translations.find((item) => item.locale === "lv")?.slug || "",
      },
      fallback: normalizeText(body.slug) || normalizeText(body.sku) || "product",
    });

    const baseSlug = await ensureUniqueBaseSlug(storefront, {
      entity: "product",
      currentId: id,
      slug: normalizeText(body.slug) || localizedSlugs.en,
    });

    const { error: updateError } = await storefront
      .from("products")
      .update({
        category_id: normalizeText(body.categoryId) || null,
        sku: normalizeText(body.sku),
        slug: baseSlug,
        sort_order: Number.isFinite(body.sortOrder) ? Math.max(0, Math.trunc(body.sortOrder ?? 0)) : 0,
        currency: normalizeText(body.currency).toUpperCase() || "EUR",
        price_cents: Math.max(0, Math.round(body.priceCents ?? 0)),
        stock_quantity: Math.max(0, Math.round(body.stockQuantity ?? 0)),
        track_inventory: body.trackInventory ?? true,
        is_active: body.isActive ?? false,
        is_featured: body.isFeatured ?? false,
        primary_image_url: primaryImageUrl,
        image_urls: imageUrls,
        updated_by: null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: translationError } = await storefront
      .from("product_translations")
      .upsert(
        translations.map((item) => ({
            product_id: id,
            locale: item.locale,
            name: item.name,
            slug: localizedSlugs[item.locale],
            short_description: null,
            description: null,
        })),
        { onConflict: "product_id,locale" },
      );

    if (translationError) {
      return NextResponse.json({ error: translationError.message }, { status: 500 });
    }

    const { error: deleteAttributesError } = await storefront
      .from("product_attribute_values")
      .delete()
      .eq("product_id", id);

    if (deleteAttributesError) {
      return NextResponse.json({ error: deleteAttributesError.message }, { status: 500 });
    }

    if (attributes.length > 0) {
      const { error: attributesError } = await storefront
        .from("product_attribute_values")
        .insert(
          attributes.map((item) => ({
            product_id: id,
            attribute_id: item.attribute_id,
            value: item.value,
            price_adjustments: item.price_adjustments,
          })),
        );

      if (attributesError) {
        return NextResponse.json({ error: attributesError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json(
      { error: message },
      { status: message === "Этот slug уже используется" ? 400 : 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const { id } = await context.params;
    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 },
    );
  }
}
