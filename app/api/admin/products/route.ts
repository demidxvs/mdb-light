import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ProductCreatePayload = {
  sku?: string;
  slug?: string;
  translations?: Array<{
    locale: LocaleKey;
    name: string;
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
        "id, sku, slug, price_cents, stock_quantity, is_active, is_featured, created_at, product_translations(locale, name)",
      )
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
    const { data: product, error: productError } = await storefront
      .from("products")
      .insert({
        sku,
        slug,
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
          short_description: null,
          description: null,
        })),
      );

    if (translationError) {
      return NextResponse.json({ error: translationError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: product.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
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
