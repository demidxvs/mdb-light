import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type ProjectPayload = {
  id?: string;
  slug?: string;
  sortOrder?: number;
  coverImageUrl?: string | null;
  isActive?: boolean;
  isFeaturedHome?: boolean;
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
      .from("projects")
      .select("id, slug, sort_order, cover_image_url, is_active, is_featured_home")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as ProjectPayload;
    const slug = normalizeText(body.slug);

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront
      .from("projects")
      .insert({
        slug,
        sort_order: Number.isFinite(body.sortOrder) ? Math.max(0, Math.trunc(body.sortOrder ?? 0)) : 0,
        cover_image_url: normalizeText(body.coverImageUrl) || null,
        is_active: body.isActive ?? true,
        is_featured_home: body.isFeaturedHome ?? false,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as ProjectPayload;
    const id = normalizeText(body.id);
    const slug = normalizeText(body.slug);

    if (!id || !slug) {
      return NextResponse.json({ error: "Project id and slug are required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront
      .from("projects")
      .update({
        slug,
        sort_order: Number.isFinite(body.sortOrder) ? Math.max(0, Math.trunc(body.sortOrder ?? 0)) : 0,
        cover_image_url: normalizeText(body.coverImageUrl) || null,
        is_active: body.isActive ?? true,
        is_featured_home: body.isFeaturedHome ?? false,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const url = new URL(request.url);
    const id = normalizeText(url.searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Project id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete project" },
      { status: 500 },
    );
  }
}
