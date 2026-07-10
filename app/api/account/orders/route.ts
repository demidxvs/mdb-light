import { NextResponse } from "next/server";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type OrderRow = {
  id: string;
  order_number: number;
  order_code: string | null;
  payment_method: "stripe" | "bank_transfer";
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  delivery_type: "parcel_locker" | "home_delivery" | null;
  total_cents: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown>;
  created_at: string;
  paid_at: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  selected_color: string | null;
  selected_length: string | null;
  selected_material: string | null;
  selected_options: Record<string, string> | null;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storefront = createStorefrontServiceClient();
    const { data: orderRows, error: orderError } = await storefront
      .from("orders")
      .select(
        "id, order_number, order_code, payment_method, status, payment_status, fulfillment_status, currency, subtotal_cents, discount_cents, shipping_cents, delivery_type, total_cents, customer_email, customer_name, customer_phone, shipping_address, created_at, paid_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orders = (orderRows as OrderRow[] | null) ?? [];
    if (orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orders.map((order) => order.id);
    const { data: itemRows, error: itemError } = await storefront
      .from("order_items")
      .select(
        "id, order_id, product_name, product_sku, quantity, unit_price_cents, total_price_cents, selected_color, selected_length, selected_material, selected_options",
      )
      .in("order_id", orderIds)
      .order("created_at", { ascending: true });

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    const itemsByOrderId = new Map<string, OrderItemRow[]>();
    ((itemRows as OrderItemRow[] | null) ?? []).forEach((item) => {
      const current = itemsByOrderId.get(item.order_id) ?? [];
      current.push(item);
      itemsByOrderId.set(item.order_id, current);
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        order_items: itemsByOrderId.get(order.id) ?? [],
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load orders" },
      { status: 500 },
    );
  }
}
