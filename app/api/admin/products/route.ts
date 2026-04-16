import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";
import { ensureUniqueBaseSlug, ensureUniqueLocalizedSlugs } from "@/lib/admin-localized-slugs";
import { normalizeSlugInput } from "@/lib/localized-slugs";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ProductCreatePayload = {
  sku?: string;
  slug?: string;
  sortOrder?: number;
  translations?: Array<{
    locale: LocaleKey;
    name: string;
    slug?: string;
  }>;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront
      .from("products")
      .select(
        "id, sku, slug, sort_order, category_id, price_cents, stock_quantity, is_active, is_featured, created_at, product_translations(locale, name, slug)",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as ProductCreatePayload;
    const sku = normalizeText(body.sku);
    const slug = normalizeText(body.slug);
    const translations =
      body.translations?.map((item) => ({
        locale: item.locale,
        name: normalizeText(item.name),
        slug: normalizeSlugInput(item.slug),
      })) ?? [];

    if (!sku || !slug) {
      return NextResponse.json({ error: "Product SKU and slug are required" }, { status: 400 });
    }

    if (translations.length !== 4 || translations.some((item) => !item.name)) {
      return NextResponse.json(
        { error: "All product translations are required" },
        { status: 400 },
      );
    }

    const storefront = createStorefrontServiceClient();
    const localizedSlugs = await ensureUniqueLocalizedSlugs(storefront, {
      entity: "product",
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
      fallback: slug || sku || "product",
    });

    const baseSlug = await ensureUniqueBaseSlug(storefront, {
      entity: "product",
      slug: slug || localizedSlugs.en,
    });

    const { data: product, error: productError } = await storefront
      .from("products")
      .insert({
        sku,
        slug: baseSlug,
        sort_order: Number.isFinite(body.sortOrder) ? Math.max(0, Math.trunc(body.sortOrder ?? 0)) : 0,
        currency: "EUR",
        price_cents: 0,
        stock_quantity: 0,
        track_inventory: true,
        is_active: false,
        is_featured: false,
        created_by: null,
        updated_by: null,
      })
      .select("id")
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: productError?.message || "Failed to create product" },
        { status: 500 },
      );
    }

    const { error: translationError } = await storefront
      .from("product_translations")
      .insert(
        translations.map((item) => ({
            product_id: product.id,
            locale: item.locale,
            name: item.name,
            slug: localizedSlugs[item.locale],
            short_description: null,
            description: null,
          })),
      );

    if (translationError) {
      return NextResponse.json({ error: translationError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: product.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      { error: message },
      { status: message === "Этот slug уже используется" ? 400 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as { id?: string };
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();

    const { error: cartItemsError } = await storefront
      .from("cart_items")
      .delete()
      .eq("product_id", id);

    if (cartItemsError) {
      return NextResponse.json({ error: cartItemsError.message }, { status: 500 });
    }

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
