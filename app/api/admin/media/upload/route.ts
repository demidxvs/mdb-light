import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";
import { MEDIA_BUCKET } from "@/lib/storage";

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function ensureMediaBucket() {
  const storefront = createStorefrontServiceClient();
  const { data: buckets, error: listError } = await storefront.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  const exists = (buckets ?? []).some((bucket) => bucket.id === MEDIA_BUCKET);
  if (exists) return storefront;

  const { error: createError } = await storefront.storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/*"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(createError.message);
  }

  return storefront;
}

export async function POST(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = normalizeText(formData.get("folder"));
    const slug = normalizeText(formData.get("slug"));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!["categories", "products", "projects"].includes(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "image";
    const safeSlug = sanitizeFileName(slug) || folder;
    const path = `${folder}/${safeSlug}-${crypto.randomUUID()}-${safeName}.${extension}`;

    const storefront = await ensureMediaBucket();
    const { error: uploadError } = await storefront.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = storefront.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path,
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 },
    );
  }
}
