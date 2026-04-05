import { NextResponse } from "next/server";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type CartBaseRow = {
  id: string;
  user_id: string;
  status: string;
  currency: string;
  discount_cents?: number | null;
  created_at: string;
};

type ProfileLookupRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type CartItemLookupRow = {
  id: string;
  cart_id: string;
  quantity: number;
  unit_price_cents: number;
  selected_color: string | null;
  selected_length: string | null;
  selected_material: string | null;
  selected_options: Record<string, string> | null;
  product_snapshot: {
    name?: string;
    sku?: string;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: Record<string, string> | null;
  } | null;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const storefront = createStorefrontServiceClient();

    const withDiscount = await storefront
      .from("carts")
      .select("id, user_id, status, currency, discount_cents, created_at")
      .order("created_at", { ascending: false });

    let cartRows = (withDiscount.data as CartBaseRow[] | null) ?? [];
    let loadError = withDiscount.error;

    if (withDiscount.error) {
      const fallback = await storefront
        .from("carts")
        .select("id, user_id, status, currency, created_at")
        .order("created_at", { ascending: false });

      cartRows = ((fallback.data as Omit<CartBaseRow, "discount_cents">[] | null) ?? []).map(
        (cart) => ({
          ...cart,
          discount_cents: 0,
        }),
      );
      loadError = fallback.error;
    }

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 });
    }

    if (cartRows.length === 0) {
      return NextResponse.json({ carts: [] });
    }

    const userIds = Array.from(new Set(cartRows.map((cart) => cart.user_id)));
    const cartIds = cartRows.map((cart) => cart.id);

    const [{ data: profileRows }, { data: itemRows, error: itemError }] = await Promise.all([
      storefront.from("profiles").select("id, email, full_name").in("id", userIds),
      storefront
        .from("cart_items")
        .select("id, cart_id, quantity, unit_price_cents, selected_color, selected_length, selected_material, selected_options, product_snapshot")
        .in("cart_id", cartIds),
    ]);

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    const profilesById = new Map(
      ((profileRows as ProfileLookupRow[] | null) ?? []).map((profile) => [profile.id, profile]),
    );
    const itemsByCartId = new Map<string, CartItemLookupRow[]>();

    ((itemRows as CartItemLookupRow[] | null) ?? []).forEach((item) => {
      const current = itemsByCartId.get(item.cart_id) ?? [];
      current.push(item);
      itemsByCartId.set(item.cart_id, current);
    });

    const carts = cartRows.map((cart) => {
      const profile = profilesById.get(cart.user_id);
      return {
        ...cart,
        discount_cents: cart.discount_cents ?? 0,
        profiles: profile
          ? {
              email: profile.email,
              full_name: profile.full_name,
            }
          : null,
        cart_items: (itemsByCartId.get(cart.id) ?? []).map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          selected_color: item.selected_color,
          selected_length: item.selected_length,
          selected_material: item.selected_material,
          selected_options: item.selected_options,
          product_snapshot: item.product_snapshot,
        })),
      };
    });

    return NextResponse.json({ carts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load carts" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as { id?: string; discountCents?: number };
    const id = normalizeText(body.id);

    if (!id || !Number.isFinite(body.discountCents)) {
      return NextResponse.json(
        { error: "Cart id and discount are required" },
        { status: 400 },
      );
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront
      .from("carts")
      .update({ discount_cents: Math.max(0, Math.round(body.discountCents ?? 0)) })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cart discount" },
      { status: 500 },
    );
  }
}
