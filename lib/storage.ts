import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export const MEDIA_BUCKET = "catalog-media";

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uploadAdminImage(options: {
  file: File;
  folder: "categories" | "products";
  slug: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const extension = options.file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeName = sanitizeFileName(options.file.name.replace(/\.[^.]+$/, "")) || "image";
  const safeSlug = sanitizeFileName(options.slug) || options.folder;
  const path = `${options.folder}/${safeSlug}-${crypto.randomUUID()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, options.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: options.file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
