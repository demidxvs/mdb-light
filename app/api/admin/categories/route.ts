import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type LocaleKey = "en" | "ru" | "el" | "lv";

type CategoryPayload = {
  id?: string;
  slug?: string;
  sortOrder?: number;
  coverImageUrl?: string | null;
  isActive?: boolean;
  translations?: Array<{
    locale: LocaleKey;
    name: string;
    description?: string | null;
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
      .from("categories")
      .select(
        "id, slug, sort_order, cover_image_url, is_active, category_translations(locale, name, description)",
      )
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as CategoryPayload;
    const slug = normalizeText(body.slug);
    const translations =
      body.translations?.map((item) => ({
        locale: item.locale,
        name: normalizeText(item.name),
        description: normalizeText(item.description),
      })) ?? [];

    if (!slug) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }

    if (translations.length !== 4 || translations.some((item) => !item.name)) {
      return NextResponse.json(
        { error: "All category translations are required" },
        { status: 400 },
      );
    }

    const storefront = createStorefrontServiceClient();
    const payload = {
      slug,
      sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
      cover_image_url: normalizeText(body.coverImageUrl) || null,
      is_active: body.isActive ?? true,
    };

    let categoryId = body.id?.trim() || "";

    if (categoryId) {
      const { error } = await storefront
        .from("categories")
        .update(payload)
        .eq("id", categoryId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { data, error } = await storefront
        .from("categories")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: error?.message || "Failed to create category" },
          { status: 500 },
        );
      }

      categoryId = data.id;
    }

    const { error: translationError } = await storefront
      .from("category_translations")
      .upsert(
        translations.map((item) => ({
          category_id: categoryId,
          locale: item.locale,
          name: item.name,
          description: item.description || null,
        })),
        { onConflict: "category_id,locale" },
      );

    if (translationError) {
      return NextResponse.json({ error: translationError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: categoryId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save category" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as {
      firstId?: string;
      firstSortOrder?: number;
      secondId?: string;
      secondSortOrder?: number;
    };

    if (!body.firstId || !body.secondId) {
      return NextResponse.json({ error: "Category ids are required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const [first, second] = await Promise.all([
      storefront
        .from("categories")
        .update({ sort_order: body.firstSortOrder ?? 0 })
        .eq("id", body.firstId),
      storefront
        .from("categories")
        .update({ sort_order: body.secondSortOrder ?? 0 })
        .eq("id", body.secondId),
    ]);

    if (first.error || second.error) {
      return NextResponse.json(
        { error: first.error?.message || second.error?.message || "Failed to reorder categories" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder categories" },
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
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.from("categories").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete category" },
      { status: 500 },
    );
  }
}
