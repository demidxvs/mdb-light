import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type LocaleKey = "en" | "ru" | "el" | "lv";

type ReorderPayload = {
  firstId?: string;
  firstSortOrder?: number;
  secondId?: string;
  secondSortOrder?: number;
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
    await context.params;
    const body = (await request.json()) as ReorderPayload;

    if (!body.firstId || !body.secondId) {
      return NextResponse.json({ error: "Product ids are required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const [first, second] = await Promise.all([
      storefront
        .from("products")
        .update({ sort_order: body.firstSortOrder ?? 0 })
        .eq("id", body.firstId),
      storefront
        .from("products")
        .update({ sort_order: body.secondSortOrder ?? 0 })
        .eq("id", body.secondId),
    ]);

    if (first.error || second.error) {
      return NextResponse.json(
        { error: first.error?.message || second.error?.message || "Failed to reorder products" },
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
