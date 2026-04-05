import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";
import { normalizeAttributeOptionValues } from "@/lib/attribute-options";

type AttributePayload = {
  id?: string;
  slug?: string;
  nameRu?: string;
  nameEn?: string;
  nameLv?: string;
  nameEl?: string;
  valueType?: "text" | "boolean" | "multi_select";
  optionValues?: Array<{
    slug?: string;
    labelRu?: string;
    labelEn?: string;
    labelLv?: string;
    labelEl?: string;
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
      .from("attributes")
      .select(
        "id, slug, name_ru, name_en, name_lv, name_el, value_type, option_values, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attributes: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load attributes" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as AttributePayload;
    const payload = {
      slug: normalizeText(body.slug),
      name_ru: normalizeText(body.nameRu),
      name_en: normalizeText(body.nameEn),
      name_lv: normalizeText(body.nameLv),
      name_el: normalizeText(body.nameEl),
      value_type: body.valueType ?? "text",
      option_values:
        body.valueType === "multi_select"
          ? normalizeAttributeOptionValues(
              (body.optionValues ?? []).map((option) => ({
                slug: normalizeText(option.slug),
                label_ru: normalizeText(option.labelRu),
                label_en: normalizeText(option.labelEn),
                label_lv: normalizeText(option.labelLv),
                label_el: normalizeText(option.labelEl),
              })),
            )
          : [],
    };

    if (
      !payload.slug ||
      !payload.name_ru ||
      !payload.name_en ||
      !payload.name_lv ||
      !payload.name_el
    ) {
      return NextResponse.json({ error: "All attribute names are required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const id = normalizeText(body.id);

    const result = id
      ? await storefront.from("attributes").update(payload).eq("id", id)
      : await storefront.from("attributes").insert(payload);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save attribute" },
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
      return NextResponse.json({ error: "Attribute id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.from("attributes").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete attribute" },
      { status: 500 },
    );
  }
}
