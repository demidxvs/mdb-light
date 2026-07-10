import { NextResponse } from "next/server";
import { isLocale, localizePathname, type Locale } from "@/i18n/config";
import { getStripeServerClient, isStripeConfigured } from "@/lib/stripe";
import {
  attachStripeSessionToOrder,
  createOrderFromActiveCart,
  createOrderFromGuestCheckout,
  rollbackOrderCreation,
} from "@/lib/order-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";
import { validateShippingAddress } from "@/lib/shipping-address";

type CheckoutRequestBody = {
  locale?: string;
  paymentMethod?: "stripe" | "bank_transfer";
  promoCode?: string;
  createAccount?: boolean;
  password?: string;
  confirmPassword?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    note?: string;
  };
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  items?: Array<{
    productId?: string;
    quantity?: number;
    selectedColor?: string | null;
    selectedLength?: string | null;
    selectedMaterial?: string | null;
    selectedOptions?: Record<string, string> | null;
    selectedOptionLabels?: Record<string, string> | null;
    productSnapshot?: {
      name?: string;
      sku?: string;
      slug?: string;
      image_url?: string | null;
      selected_color?: string | null;
      selected_length?: string | null;
      selected_material?: string | null;
      selected_options?: Record<string, string> | null;
    } | null;
  }>;
};

function getLocaleFromBody(value: string | undefined): Locale {
  return isLocale(value) ? value : "en";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StripeLineItem = {
  quantity: number;
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: {
      name: string;
      description?: string;
    };
  };
};

function buildStripeLineItems(order: Awaited<ReturnType<typeof createOrderFromActiveCart>>) {
  const lineItems: StripeLineItem[] = [];
  let remainingDiscount = order.discountCents;

  order.items.forEach((item, index) => {
    const rawTotalCents = Math.max(0, Math.round(item.totalCents));
    const isLastItem = index === order.items.length - 1;
    const allocatedDiscount = order.discountCents > 0 && order.subtotalCents > 0
      ? isLastItem
        ? remainingDiscount
        : Math.min(
            rawTotalCents,
            Math.round(rawTotalCents * (order.discountCents / order.subtotalCents)),
          )
      : 0;
    remainingDiscount = Math.max(0, remainingDiscount - allocatedDiscount);
    const discountedTotalCents = Math.max(0, rawTotalCents - allocatedDiscount);
    if (discountedTotalCents <= 0) return;

    lineItems.push({
      quantity: 1,
      price_data: {
        currency: (item.currency || order.currency || "EUR").toLowerCase(),
        unit_amount: discountedTotalCents,
        product_data: {
          name: item.quantity > 1 ? `${item.name || "MDB Light product"} x ${item.quantity}` : item.name || "MDB Light product",
          description: item.variantLines.join(" · ") || undefined,
        },
      },
    });
  });

  if (order.shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: (order.currency || "EUR").toLowerCase(),
        unit_amount: order.shippingCents,
        product_data: {
          name: order.deliveryType === "home_delivery" ? "Home delivery" : "Parcel locker delivery",
          description: undefined,
        },
      },
    });
  }

  return lineItems;
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutRequestBody;
    const locale = getLocaleFromBody(body.locale);
    const paymentMethod = body.paymentMethod === "bank_transfer" ? "bank_transfer" : "stripe";
    const customer = {
      firstName: body.customer?.firstName?.trim() || "",
      lastName: body.customer?.lastName?.trim() || "",
      email: body.customer?.email?.trim() || "",
      phone: body.customer?.phone?.trim() || "",
      note: body.customer?.note?.trim() || "",
    };

    if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
      return NextResponse.json({ error: "Missing checkout fields." }, { status: 400 });
    }

    if (!emailRegex.test(customer.email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const shippingAddressResult = validateShippingAddress(body.shippingAddress);
    if (!shippingAddressResult.valid) {
      return NextResponse.json(
        {
          error:
            shippingAddressResult.error === "too_long"
              ? "Delivery address is too long."
              : "Missing delivery address fields.",
        },
        { status: 400 },
      );
    }

    const shippingAddress = shippingAddressResult.address;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id ?? null;

    if (!userId && body.createAccount) {
      const password = body.password || "";
      const confirmPassword = body.confirmPassword || "";

      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Password confirmation does not match." }, { status: 400 });
      }

      const storefront = createStorefrontServiceClient();
      const { data: createdUser, error: createUserError } = await storefront.auth.admin.createUser({
        email: customer.email,
        password,
        email_confirm: false,
        user_metadata: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          full_name: `${customer.firstName} ${customer.lastName}`.trim(),
          phone: customer.phone,
          locale,
        },
      });

      if (createUserError || !createdUser.user) {
        const message = createUserError?.message || "Failed to create account.";
        const alreadyExists =
          message.toLowerCase().includes("already") || message.toLowerCase().includes("registered");
        return NextResponse.json(
          { error: alreadyExists ? "This email is already in use. Please sign in." : message },
          { status: alreadyExists ? 409 : 400 },
        );
      }

      createdUserId = createdUser.user.id;
      userId = createdUser.user.id;
    }

    const order = userId
      ? await createOrderFromActiveCart({
          userId,
          locale,
          paymentMethod,
          customer,
          shippingAddress,
          promoCode: body.promoCode,
        })
      : await createOrderFromGuestCheckout({
          locale,
          paymentMethod,
          customer,
          shippingAddress,
          promoCode: body.promoCode,
          items: (body.items ?? [])
            .filter((item) => item.productId && item.quantity)
            .map((item) => ({
              productId: item.productId as string,
              quantity: Number(item.quantity) || 0,
              selectedColor: item.selectedColor ?? null,
              selectedLength: item.selectedLength ?? null,
              selectedMaterial: item.selectedMaterial ?? null,
              selectedOptions: item.selectedOptions ?? {},
              selectedOptionLabels: item.selectedOptionLabels ?? {},
              productSnapshot: item.productSnapshot ?? null,
            })),
        });

    if (paymentMethod === "bank_transfer") {
      const bankTransferUrl = new URL(
        localizePathname("/checkout/bank-transfer", locale),
        request.url,
      );
      bankTransferUrl.searchParams.set("order", order.orderCode);
      bankTransferUrl.searchParams.set("total", String(order.totalCents));
      bankTransferUrl.searchParams.set("currency", order.currency);

      return NextResponse.json({
        ok: true,
        orderCode: order.orderCode,
        url: bankTransferUrl.toString(),
        clearGuestCart: !user,
      });
    }

    if (!isStripeConfigured()) {
      if (order.cartId) {
        await rollbackOrderCreation(order.id, order.cartId);
      }
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    const lineItems = buildStripeLineItems(order);

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
        customer_email: order.customerEmail || user?.email || undefined,
        metadata: {
          order_id: order.id,
          order_code: order.orderCode,
          customer_email: order.customerEmail || user?.email || "",
          locale,
        },
        payment_intent_data: {
          description: `MDB Light Order ${order.orderCode}`,
          metadata: {
            order_id: order.id,
            order_code: order.orderCode,
            customer_email: order.customerEmail || user?.email || "",
          },
        },
      });

      await attachStripeSessionToOrder(order.id, session);

      return NextResponse.json({
        url: session.url,
        orderCode: order.orderCode,
        clearGuestCart: !user,
      });
    } catch (error) {
      if (order.cartId) {
        await rollbackOrderCreation(order.id, order.cartId);
      }
      throw error;
    }
  } catch (error) {
    if (createdUserId) {
      try {
        const storefront = createStorefrontServiceClient();
        await storefront.auth.admin.deleteUser(createdUserId);
      } catch (rollbackUserError) {
        console.error("Checkout account rollback failed", rollbackUserError);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
