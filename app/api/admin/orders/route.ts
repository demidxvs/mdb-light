import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { getInvoicesByOrderIds } from "@/lib/order-invoice";
import { markOrderPaid } from "@/lib/order-service";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type OrderRow = {
  id: string;
  order_number: number;
  order_code: string | null;
  payment_method: "stripe" | "bank_transfer";
  payment_id: string | null;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  paid_at: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  pdf_path: string | null;
  pdf_generated_at: string | null;
  status: string;
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

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const storefront = createStorefrontServiceClient();
    const { data: orderRows, error: orderError } = await storefront
      .from("orders")
      .select(
        "id, order_number, order_code, payment_method, payment_id, status, payment_status, fulfillment_status, currency, subtotal_cents, discount_cents, total_cents, customer_email, customer_name, customer_phone, created_at, paid_at",
      )
      .order("created_at", { ascending: false });

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orders = (orderRows as OrderRow[] | null) ?? [];
    if (orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orders.map((order) => order.id);
    const [itemResult, invoicesByOrderId] = await Promise.all([
      storefront
        .from("order_items")
        .select(
          "id, order_id, product_name, product_sku, quantity, unit_price_cents, total_price_cents, selected_color, selected_length, selected_material, selected_options",
        )
        .in("order_id", orderIds)
        .order("created_at", { ascending: true }),
      getInvoicesByOrderIds(orderIds),
    ]);

    const itemRows = itemResult.data;
    const itemError = itemResult.error;

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
        invoice: (invoicesByOrderId.get(order.id) as InvoiceRow | undefined) ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json()) as {
      id?: string;
      action?: string;
      locale?: string;
      status?: string;
      paymentStatus?: string;
      fulfillmentStatus?: string;
    };
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const locale = isLocale(body.locale) ? body.locale : "en";

    if (normalizeText(body.action) === "mark_paid") {
      const order = await markOrderPaid({
        orderId: id,
        locale,
        paymentId: null,
      });

      return NextResponse.json({ ok: true, order });
    }

    const { data: existingOrder, error: existingOrderError } = await storefront
      .from("orders")
      .select("id, payment_status")
      .eq("id", id)
      .maybeSingle();

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { error: existingOrderError?.message || "Order not found" },
        { status: 404 },
      );
    }

    const payload = {
      status: normalizeText(body.status) || undefined,
      payment_status: normalizeText(body.paymentStatus) || undefined,
      fulfillment_status: normalizeText(body.fulfillmentStatus) || undefined,
    };

    const marksAsPaid =
      payload.status === "paid" ||
      payload.payment_status === "paid";

    if (marksAsPaid && existingOrder.payment_status !== "paid") {
      const order = await markOrderPaid({
        orderId: id,
        locale,
        paymentId: null,
      });

      return NextResponse.json({ ok: true, order });
    }

    const { error } = await storefront
      .from("orders")
      .update(payload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 },
    );
  }
}
