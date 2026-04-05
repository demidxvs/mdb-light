export const MEDIA_BUCKET = "catalog-media";
export const INVOICE_PDF_BUCKET = "invoice-pdfs";

export async function uploadAdminImage(options: {
  file: File;
  folder: "categories" | "products" | "projects";
  slug: string;
}) {
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("folder", options.folder);
  formData.append("slug", options.slug);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    path?: string;
    publicUrl?: string;
  };

  if (!response.ok || !payload.path || !payload.publicUrl) {
    throw new Error(payload.error || "Failed to upload image");
  }

  return {
    path: payload.path,
    publicUrl: payload.publicUrl,
  };
}

export async function uploadAdminInvoicePdf(options: {
  invoiceId: string;
  file: Blob;
}) {
  const formData = new FormData();
  formData.append("invoiceId", options.invoiceId);
  formData.append("file", options.file, "invoice.pdf");

  const response = await fetch("/api/admin/invoices/storage", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    path?: string;
  };

  if (!response.ok || !payload.path) {
    throw new Error(payload.error || "Failed to upload invoice PDF");
  }

  return { path: payload.path };
}

export async function deleteAdminInvoicePdf(path: string) {
  const response = await fetch("/api/admin/invoices/storage", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error || "Failed to delete invoice PDF");
  }
}

export async function getAdminInvoicePdfUrl(path: string) {
  const response = await fetch(`/api/admin/invoices/storage?path=${encodeURIComponent(path)}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    signedUrl?: string;
  };
  if (!response.ok || !payload.signedUrl) {
    throw new Error(payload.error || "Failed to create invoice PDF URL");
  }
  return payload.signedUrl;
}
