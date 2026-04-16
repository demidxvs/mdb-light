import { NextResponse } from "next/server";
import type { SelectedOptionMap } from "@/lib/attribute-options";
import { getOrCreateActiveCart, type GuestCartItem } from "@/lib/cart";
import { verifyInvoiceCartToken } from "@/lib/invoice-cart-link";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createVariantKey } from "@/lib/attribute-options";

type InvoiceItemRow = {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price_cents: number;
  sku: string | null;
  name: string;
};

type ProductLookupRow = {
  id: string;
  slug: string | null;
  primary_image_url: string | null;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildGuestItemId(productId: string, variantKey: string, unitPriceCents: number) {
  return [productId, variantKey, "", "", "", String(unitPriceCents)].join("::");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = normalizeText(body.token);

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const invoiceId = verifyInvoiceCartToken(token);
    if (!invoiceId) {
      return NextResponse.json({ error: "Invalid cart link." }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data: invoiceItems, error: itemsError } = await storefront
      .from("invoice_items")
      .select("id, product_id, quantity, unit_price_cents, sku, name")
      .eq("invoice_id", invoiceId)
      .order("position", { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const productRows = ((invoiceItems as InvoiceItemRow[] | null) ?? []).filter(
      (item) => item.product_id,
    ) as Array<InvoiceItemRow & { product_id: string }>;

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Invoice has no linked products." }, { status: 400 });
    }

    const productIds = Array.from(new Set(productRows.map((item) => item.product_id)));
    const { data: products, error: productsError } = await storefront
      .from("products")
      .select("id, slug, primary_image_url")
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    const productsById = new Map(
      ((products as ProductLookupRow[] | null) ?? []).map((product) => [product.id, product]),
    );

    const groupedItems = new Map<string, GuestCartItem>();

    productRows.forEach((item) => {
      const product = productsById.get(item.product_id);
      if (!product) return;

      const selectedOptions: SelectedOptionMap | null = null;
      const variantKey = createVariantKey(selectedOptions);
      const quantity = Math.max(1, item.quantity || 1);
      const unitPriceCents = Math.max(0, item.unit_price_cents || 0);
      const groupingKey = [item.product_id, variantKey, unitPriceCents, item.sku || ""].join("::");
      const existing = groupedItems.get(groupingKey);

      if (existing) {
        groupedItems.set(groupingKey, {
          ...existing,
          quantity: existing.quantity + quantity,
        });
        return;
      }

      groupedItems.set(groupingKey, {
        id: buildGuestItemId(item.product_id, variantKey, unitPriceCents),
        product_id: item.product_id,
        quantity,
        unit_price_cents: unitPriceCents,
        currency: "EUR",
        selected_color: null,
        selected_length: null,
        selected_material: null,
        selected_options: null,
        variant_key: variantKey,
        product_snapshot: {
          sku: item.sku || undefined,
          slug: product.slug || undefined,
          name: item.name,
          image_url: product.primary_image_url,
          selected_color: null,
          selected_length: null,
          selected_material: null,
          selected_options: null,
        },
      });
    });

    const normalizedItems = Array.from(groupedItems.values());

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Invoice products are unavailable." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ mode: "guest", items: normalizedItems });
    }

    const cart = await getOrCreateActiveCart(storefront, user.id, "EUR");

    const { error: clearError } = await storefront.from("cart_items").delete().eq("cart_id", cart.id);
    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 });
    }

    const { error: insertError } = await storefront.from("cart_items").insert(
      normalizedItems.map((item) => ({
        cart_id: cart.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        currency: item.currency,
        selected_color: item.selected_color,
        selected_length: item.selected_length,
        selected_material: item.selected_material,
        selected_options: item.selected_options,
        variant_key: item.variant_key,
        product_snapshot: item.product_snapshot,
      })),
    );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ mode: "authenticated" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load invoice cart." },
      { status: 500 },
    );
  }
}
