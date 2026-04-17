import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ReorderPayload = {
  orderedIds?: string[];
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const { id } = await context.params;
    const storefront = createStorefrontServiceClient();

    const [categoriesResult, categoryResult, productsResult] = await Promise.all([
      storefront
        .from("categories")
        .select("id, slug, sort_order, category_translations(locale, name, slug)")
        .order("sort_order", { ascending: true }),
      storefront
        .from("categories")
        .select("id, slug, category_translations(locale, name, slug)")
        .eq("id", id)
        .maybeSingle(),
      storefront
        .from("products")
        .select("id, sku, slug, sort_order, is_active, product_translations(locale, name, slug)")
        .eq("category_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    if (categoryResult.error || !categoryResult.data) {
      return NextResponse.json(
        { error: categoryResult.error?.message || "Category not found" },
        { status: 404 },
      );
    }

    if (categoriesResult.error || productsResult.error) {
      return NextResponse.json(
        { error: categoriesResult.error?.message || productsResult.error?.message || "Failed to load category products" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      category: categoryResult.data as {
        id: string;
        slug: string;
        category_translations?: Array<{ locale: LocaleKey; name: string; slug?: string | null }>;
      },
      categories: (categoriesResult.data ?? []) as Array<{
        id: string;
        slug: string;
        sort_order: number;
        category_translations?: Array<{ locale: LocaleKey; name: string; slug?: string | null }>;
      }>,
      products: (productsResult.data ?? []) as Array<{
        id: string;
        sku: string;
        slug: string;
        sort_order: number;
        is_active: boolean;
        product_translations?: Array<{ locale: LocaleKey; name: string; slug?: string | null }>;
      }>,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load category products" },
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
    const { id: categoryId } = await context.params;
    const body = (await request.json()) as ReorderPayload;

    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "Ordered product ids are required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();

    const { data: existingProducts, error: existingProductsError } = await storefront
      .from("products")
      .select("id")
      .eq("category_id", categoryId);

    if (existingProductsError) {
      return NextResponse.json(
        { error: existingProductsError.message || "Failed to load category products" },
        { status: 500 },
      );
    }

    const existingIds = ((existingProducts as Array<{ id: string }> | null) ?? []).map((product) => product.id);

    if (existingIds.length !== orderedIds.length || existingIds.some((id) => !orderedIds.includes(id))) {
      return NextResponse.json({ error: "Provided product order is invalid" }, { status: 400 });
    }

    const updates = orderedIds.map((productId, index) =>
      storefront
        .from("products")
        .update({ sort_order: index })
        .eq("id", productId)
        .eq("category_id", categoryId),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      return NextResponse.json(
        { error: failed.error.message || "Failed to reorder products" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder products" },
      { status: 500 },
    );
  }
}
