import { NextResponse } from "next/server";
import { isLocale, localizePathname, type Locale } from "@/i18n/config";
import { getStripeServerClient, isStripeConfigured } from "@/lib/stripe";
import {
  attachStripeSessionToOrder,
  createOrderFromActiveCart,
  rollbackOrderCreation,
} from "@/lib/order-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type CheckoutRequestBody = {
  locale?: string;
  paymentMethod?: "stripe" | "bank_transfer";
};

function getLocaleFromBody(value: string | undefined): Locale {
  return isLocale(value) ? value : "en";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutRequestBody;
    const locale = getLocaleFromBody(body.locale);
    const paymentMethod = body.paymentMethod === "bank_transfer" ? "bank_transfer" : "stripe";
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await createOrderFromActiveCart({
      userId: user.id,
      locale,
      paymentMethod,
    });

    if (paymentMethod === "bank_transfer") {
      const bankTransferUrl = new URL(
        localizePathname("/checkout/bank-transfer", locale),
        request.url,
      );
      bankTransferUrl.searchParams.set("order", order.orderCode);

      return NextResponse.json({
        ok: true,
        orderCode: order.orderCode,
        url: bankTransferUrl.toString(),
      });
    }

    if (!isStripeConfigured()) {
      await rollbackOrderCreation(order.id, order.cartId);
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    const lineItems = order.items.map((item) => {
      return {
        quantity: item.quantity,
        price_data: {
          currency: (item.currency || order.currency || "EUR").toLowerCase(),
          unit_amount: Math.round(item.totalCents / Math.max(item.quantity, 1)),
          product_data: {
            name: item.name || "MDB Light product",
            description: item.variantLines.join(" · ") || undefined,
          },
        },
      };
    });

    const requestUrl = new URL(request.url);
    const successUrl = new URL(
      localizePathname("/checkout/success", locale),
      requestUrl.origin,
    );
    successUrl.searchParams.set("{CHECKOUT_SESSION_ID}", "");
    const cancelUrl = new URL(
      localizePathname("/checkout/cancel", locale),
      requestUrl.origin,
    );
    cancelUrl.searchParams.set("order", order.orderCode);

    try {
      const stripe = getStripeServerClient();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${successUrl.origin}${successUrl.pathname}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl.toString(),
        customer_email: order.customerEmail || user.email || undefined,
        metadata: {
          order_id: order.id,
          order_code: order.orderCode,
          customer_email: order.customerEmail || user.email || "",
          locale,
        },
        payment_intent_data: {
          description: `MDB Light Order ${order.orderCode}`,
          metadata: {
            order_id: order.id,
            order_code: order.orderCode,
            customer_email: order.customerEmail || user.email || "",
          },
        },
      });

      await attachStripeSessionToOrder(order.id, session);

      return NextResponse.json({ url: session.url, orderCode: order.orderCode });
    } catch (error) {
      await rollbackOrderCreation(order.id, order.cartId);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
