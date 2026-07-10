import type Stripe from "stripe";
import type { Locale } from "@/i18n/config";
import { normalizeSelectedOptionsMap, type SelectedOptionMap } from "@/lib/attribute-options";
import { sendOrderCreatedEmails, sendOrderPaidEmails } from "@/lib/order-mail";
import {
  createOrderInvoice,
  deleteOrderInvoice,
  getOrderInvoiceAttachment,
  markOrderInvoicePaid,
} from "@/lib/order-invoice";
import {
  buildOrderCode,
  type OrderPaymentMethod,
} from "@/lib/order-utils";
import {
  calculatePricing,
  getDeliveryOption,
  normalizePromoCode,
} from "@/lib/pricing.mjs";
import {
  formatShippingAddress,
  type ShippingAddress,
} from "@/lib/shipping-address";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";

type CartRow = {
  id: string;
  currency: string;
  discount_cents: number | null;
};

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

type CartItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  delivery_type: string | null;
  delivery_cents: number | null;
  currency: string;
  selected_color: string | null;
  selected_length: string | null;
  selected_material: string | null;
  selected_options: Record<string, string> | null;
  product_snapshot: {
    name?: string;
    sku?: string;
    delivery_type?: string | null;
    delivery_cents?: number | null;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: Record<string, string> | null;
  } | null;
};

type ProductPriceRow = {
  id: string;
  sku: string | null;
  slug: string;
  currency: string;
  price_cents: number;
  delivery_type?: string | null;
  primary_image_url: string | null;
};

type ProductAttributeValueRow = {
  product_id: string;
  price_adjustments?: Record<string, number> | null;
  attributes?:
    | {
        slug: string;
      }
    | Array<{
        slug: string;
      }>
    | null;
};

export type CheckoutCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note?: string;
};

export type GuestCheckoutItemInput = {
  productId: string;
  quantity: number;
  selectedColor?: string | null;
  selectedLength?: string | null;
  selectedMaterial?: string | null;
  selectedOptions?: SelectedOptionMap | null;
  selectedOptionLabels?: SelectedOptionMap | null;
  productSnapshot?: {
    name?: string;
    sku?: string;
    slug?: string;
    image_url?: string | null;
    selected_color?: string | null;
    selected_length?: string | null;
    selected_material?: string | null;
    selected_options?: SelectedOptionMap | null;
  } | null;
};

type OrderItemEmailPayload = {
  name: string;
  quantity: number;
  totalCents: number;
  currency: string;
  variantLines: string[];
};

export type OrderSummary = {
  id: string;
  cartId: string;
  orderNumber: number;
  orderCode: string;
  createdAt: string;
  currency: string;
  totalCents: number;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  deliveryType: string | null;
  promoCode: string | null;
  promoDiscountPercent: number;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  paymentMethod: OrderPaymentMethod;
  items: OrderItemEmailPayload[];
};

function getVariantLines(item: CartItemRow) {
  const lines: string[] = [];

  if (item.selected_color || item.product_snapshot?.selected_color) {
    lines.push(`Color: ${item.selected_color || item.product_snapshot?.selected_color}`);
  }

  if (item.selected_length || item.product_snapshot?.selected_length) {
    lines.push(`Length: ${item.selected_length || item.product_snapshot?.selected_length}`);
  }

  if (item.selected_material || item.product_snapshot?.selected_material) {
    lines.push(`Material: ${item.selected_material || item.product_snapshot?.selected_material}`);
  }

  for (const [key, value] of Object.entries(
    item.product_snapshot?.selected_options || item.selected_options || {},
  )) {
    if (value) {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines;
}

async function loadCheckoutContext(userId: string) {
  const storefront = createStorefrontServiceClient();
  const [{ data: cart, error: cartError }, { data: profile, error: profileError }] =
    await Promise.all([
      storefront
        .from("carts")
        .select("id, currency, discount_cents")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      storefront
        .from("profiles")
        .select("email, full_name, phone")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  if (cartError || !cart) {
    throw new Error(cartError?.message || "Active cart not found.");
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: cartItems, error: itemsError } = await storefront
    .from("cart_items")
    .select(
      "id, product_id, quantity, unit_price_cents, delivery_type, delivery_cents, currency, selected_color, selected_length, selected_material, selected_options, product_snapshot",
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const items = ((cartItems as CartItemRow[] | null) ?? []).filter(
    (item) => item.quantity > 0 && item.unit_price_cents >= 0,
  );

  if (items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return {
    storefront,
    cart: cart as CartRow,
    profile: (profile as ProfileRow | null) ?? null,
    items,
  };
}

async function loadGuestCheckoutContext(items: GuestCheckoutItemInput[]) {
  const storefront = createStorefrontServiceClient();
  const sanitizedItems = items
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.trunc(item.quantity)),
      selectedColor: item.selectedColor?.trim() || null,
      selectedLength: item.selectedLength?.trim() || null,
      selectedMaterial: item.selectedMaterial?.trim() || null,
      selectedOptions: normalizeSelectedOptionsMap(item.selectedOptions),
      selectedOptionLabels: normalizeSelectedOptionsMap(item.selectedOptionLabels),
    }));

  if (sanitizedItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  const productIds = Array.from(new Set(sanitizedItems.map((item) => item.productId)));
  const [{ data: productRows, error: productError }, { data: attributeRows, error: attributeError }] =
    await Promise.all([
      storefront
        .from("products")
        .select("id, sku, slug, currency, price_cents, delivery_type, primary_image_url")
        .in("id", productIds)
        .eq("is_active", true),
      storefront
        .from("product_attribute_values")
        .select("product_id, price_adjustments, attributes(slug)")
        .in("product_id", productIds),
    ]);

  if (productError) {
    throw new Error(productError.message);
  }

  if (attributeError) {
    throw new Error(attributeError.message);
  }

  const productsById = new Map(
    ((productRows as ProductPriceRow[] | null) ?? []).map((item) => [item.id, item]),
  );
  const attributesByProductId = new Map<string, ProductAttributeValueRow[]>();

  ((attributeRows as ProductAttributeValueRow[] | null) ?? []).forEach((item) => {
    const current = attributesByProductId.get(item.product_id) ?? [];
    current.push(item);
    attributesByProductId.set(item.product_id, current);
  });

  const resolvedItems: CartItemRow[] = sanitizedItems.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      throw new Error("One of the selected products is no longer available.");
    }

    const unitPriceCents =
      product.price_cents +
      (attributesByProductId.get(item.productId) ?? []).reduce((sum, attribute) => {
        const slug = Array.isArray(attribute.attributes)
          ? attribute.attributes[0]?.slug
          : attribute.attributes?.slug;
        if (!slug) return sum;
        const selectedValue = item.selectedOptions[slug];
        if (!selectedValue) return sum;
        return sum + (attribute.price_adjustments?.[selectedValue] ?? 0);
      }, 0);
    const delivery = getDeliveryOption(product.delivery_type);

    return {
      id: `guest-${item.productId}-${Math.random().toString(36).slice(2, 10)}`,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price_cents: unitPriceCents,
      delivery_type: delivery.type,
      delivery_cents: delivery.priceCents,
      currency: product.currency || "EUR",
      selected_color: item.selectedColor,
      selected_length: item.selectedLength,
      selected_material: item.selectedMaterial,
      selected_options: item.selectedOptions,
      product_snapshot: {
        name: item.productSnapshot?.name || product.sku || product.slug,
        sku: item.productSnapshot?.sku || product.sku || undefined,
        delivery_type: delivery.type,
        delivery_cents: delivery.priceCents,
        selected_color: item.selectedColor,
        selected_length: item.selectedLength,
        selected_material: item.selectedMaterial,
        selected_options: item.selectedOptionLabels,
      },
    };
  });

  return {
    storefront,
    cart: {
      id: "",
      currency: resolvedItems[0]?.currency || "EUR",
      discount_cents: 0,
    } satisfies CartRow,
    profile: null,
    items: resolvedItems,
  };
}

function buildCustomerName(customer: CheckoutCustomerInput, fallbackProfile?: ProfileRow | null) {
  const fromInput = `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();
  if (fromInput) return fromInput;
  return fallbackProfile?.full_name?.trim() || null;
}

async function resolvePromoCode(
  storefront: ReturnType<typeof createStorefrontServiceClient>,
  promoCode: string | undefined,
) {
  const code = normalizePromoCode(promoCode);
  if (!code) {
    return {
      code: null,
      discountPercent: 0,
    };
  }

  const { data, error } = await storefront
    .from("promo_codes")
    .select("code, discount_percent")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Promo code is not active.");
  }

  return {
    code: String(data.code),
    discountPercent: Number(data.discount_percent) || 0,
  };
}

async function createOrderFromCheckout(input: {
  userId: string | null;
  locale: Locale;
  paymentMethod: OrderPaymentMethod;
  customer: CheckoutCustomerInput;
  shippingAddress: ShippingAddress;
  guestItems?: GuestCheckoutItemInput[];
  promoCode?: string;
}) {
  const context = input.userId
    ? await loadCheckoutContext(input.userId)
    : await loadGuestCheckoutContext(input.guestItems ?? []);
  const { storefront, cart, profile, items } = context;
  const promo = await resolvePromoCode(storefront, input.promoCode);
  const pricing = calculatePricing({
    items,
    discountPercent: promo.discountPercent,
  });

  const { data: insertedOrder, error: orderError } = await storefront
    .from("orders")
    .insert({
      user_id: input.userId,
      cart_id: cart.id || null,
      payment_method: input.paymentMethod,
      status: "pending",
      payment_status: "unpaid",
      fulfillment_status: "unfulfilled",
      currency: cart.currency || items[0]?.currency || "EUR",
      subtotal_cents: pricing.subtotalCents,
      discount_cents: pricing.discountCents,
      shipping_cents: pricing.shippingCents,
      delivery_type: pricing.deliveryType,
      promo_code: promo.code,
      promo_discount_percent: promo.discountPercent,
      tax_cents: 0,
      total_cents: pricing.totalCents,
      customer_email: input.customer.email.trim() || profile?.email || null,
      customer_name: buildCustomerName(input.customer, profile),
      customer_phone: input.customer.phone.trim() || profile?.phone || null,
      shipping_address: input.shippingAddress,
      billing_address: {},
      notes: input.customer.note?.trim() || null,
      placed_at: new Date().toISOString(),
    })
    .select("id, order_number, created_at, currency, total_cents, subtotal_cents, discount_cents, shipping_cents, delivery_type, promo_code, promo_discount_percent, customer_email, customer_name, customer_phone, shipping_address")
    .single();

  if (orderError || !insertedOrder) {
    throw new Error(orderError?.message || "Failed to create order.");
  }

  const orderCode = buildOrderCode(insertedOrder.order_number);
  const { error: codeError } = await storefront
    .from("orders")
    .update({ order_code: orderCode })
    .eq("id", insertedOrder.id);

  if (codeError) {
    throw new Error(codeError.message);
  }

  const { error: orderItemsError } = await storefront
    .from("order_items")
    .insert(
      items.map((item) => ({
        order_id: insertedOrder.id,
        product_id: item.product_id,
        selected_color: item.selected_color,
        selected_length: item.selected_length,
        selected_material: item.selected_material,
        selected_options: item.selected_options ?? {},
        product_name:
          item.product_snapshot?.name ||
          item.product_snapshot?.sku ||
          item.product_id,
        product_sku: item.product_snapshot?.sku || null,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        total_price_cents: item.unit_price_cents * item.quantity,
        delivery_type: item.delivery_type,
        delivery_cents: item.delivery_cents ?? 0,
        product_snapshot: item.product_snapshot ?? {},
      })),
    );

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  if (cart.id) {
    const { error: cartUpdateError } = await storefront
      .from("carts")
      .update({ status: "converted" })
      .eq("id", cart.id);

    if (cartUpdateError) {
      throw new Error(cartUpdateError.message);
    }
  }

  const summary: OrderSummary = {
    id: insertedOrder.id,
    cartId: cart.id,
    orderNumber: insertedOrder.order_number,
    orderCode,
    createdAt: insertedOrder.created_at,
    currency: insertedOrder.currency,
    totalCents: insertedOrder.total_cents,
    subtotalCents: insertedOrder.subtotal_cents,
    discountCents: insertedOrder.discount_cents,
    shippingCents: insertedOrder.shipping_cents,
    deliveryType: insertedOrder.delivery_type,
    promoCode: insertedOrder.promo_code,
    promoDiscountPercent: Number(insertedOrder.promo_discount_percent) || 0,
    customerEmail: insertedOrder.customer_email,
    customerName: insertedOrder.customer_name,
    customerPhone: insertedOrder.customer_phone,
    shippingAddress: insertedOrder.shipping_address as ShippingAddress,
    paymentMethod: input.paymentMethod,
    items: items.map((item) => ({
      name:
        item.product_snapshot?.name ||
        item.product_snapshot?.sku ||
        item.product_id,
      quantity: item.quantity,
      totalCents: item.unit_price_cents * item.quantity,
      currency: item.currency,
      variantLines: getVariantLines(item),
    })),
  };

  const invoice = await createOrderInvoice({
    orderId: summary.id,
    orderCode: summary.orderCode,
    createdAt: summary.createdAt,
    customerName: summary.customerName,
    customerEmail: summary.customerEmail,
    customerPhone: summary.customerPhone,
    customerAddress: formatShippingAddress(summary.shippingAddress),
    subtotalCents: summary.subtotalCents,
    totalCents: summary.totalCents,
    items: [
      ...items.map((item) => ({
        productId: item.product_id,
        name:
          item.product_snapshot?.name ||
          item.product_snapshot?.sku ||
          item.product_id,
        sku: item.product_snapshot?.sku || null,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        totalPriceCents: item.unit_price_cents * item.quantity,
        note: getVariantLines(item).join(" • "),
      })),
      {
        productId: null,
        name: summary.deliveryType === "home_delivery" ? "Home delivery" : "Parcel locker delivery",
        sku: null,
        quantity: 1,
        unitPriceCents: summary.shippingCents,
        totalPriceCents: summary.shippingCents,
        note: summary.promoCode ? `Promo ${summary.promoCode}: ${summary.promoDiscountPercent}%` : "",
      },
    ],
  });

  if (input.paymentMethod === "bank_transfer") {
    try {
      await sendOrderCreatedEmails({
        locale: input.locale,
        orderCode,
        customerEmail: summary.customerEmail,
        customerName: summary.customerName,
        customerPhone: summary.customerPhone,
        totalCents: summary.totalCents,
        currency: summary.currency,
        paymentMethod: input.paymentMethod,
        items: summary.items,
        invoiceAttachment: invoice.attachment,
      });
    } catch (emailError) {
      console.error("Order creation email send failed", emailError);
    }
  }

  return summary;
}

export async function createOrderFromActiveCart(input: {
  userId: string;
  locale: Locale;
  paymentMethod: OrderPaymentMethod;
  customer: CheckoutCustomerInput;
  shippingAddress: ShippingAddress;
  promoCode?: string;
}) {
  return createOrderFromCheckout(input);
}

export async function createOrderFromGuestCheckout(input: {
  locale: Locale;
  paymentMethod: OrderPaymentMethod;
  customer: CheckoutCustomerInput;
  shippingAddress: ShippingAddress;
  userId?: string | null;
  items: GuestCheckoutItemInput[];
  promoCode?: string;
}) {
  return createOrderFromCheckout({
    userId: input.userId ?? null,
    locale: input.locale,
    paymentMethod: input.paymentMethod,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    guestItems: input.items,
    promoCode: input.promoCode,
  });
}

export async function getOrderByCodeForUser(orderCode: string, userId: string) {
  const storefront = createStorefrontServiceClient();
  const { data: order, error } = await storefront
    .from("orders")
    .select("id, order_number, order_code, payment_method, status, payment_status, fulfillment_status, currency, total_cents, subtotal_cents, discount_cents, shipping_cents, delivery_type, promo_code, promo_discount_percent, customer_email, customer_name, customer_phone, created_at, paid_at")
    .eq("order_code", orderCode)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !order) {
    throw new Error(error?.message || "Order not found.");
  }

  return order;
}

export async function attachStripeSessionToOrder(orderId: string, session: Stripe.Checkout.Session) {
  const storefront = createStorefrontServiceClient();
  const { error } = await storefront
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markOrderPaid(input: {
  orderId: string;
  locale: Locale;
  paymentId: string | null;
}) {
  const storefront = createStorefrontServiceClient();
  const { data: order, error: orderError } = await storefront
    .from("orders")
    .select("id, order_number, order_code, payment_method, payment_status, currency, total_cents, customer_email, customer_name, customer_phone")
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Order not found.");
  }

  if (order.payment_status === "paid") {
    return order;
  }

  const paidAt = new Date().toISOString();
  const { error: updateError } = await storefront
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      fulfillment_status: "processing",
      paid_at: paidAt,
      payment_id: input.paymentId,
      stripe_payment_intent_id: input.paymentId,
    })
    .eq("id", input.orderId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { data: itemRows, error: itemError } = await storefront
    .from("order_items")
    .select("product_name, quantity, total_price_cents, selected_color, selected_length, selected_material, selected_options")
    .eq("order_id", input.orderId)
    .order("created_at", { ascending: true });

  if (itemError) {
    throw new Error(itemError.message);
  }

  try {
    await markOrderInvoicePaid(input.orderId);
  } catch (invoiceError) {
    console.error("Order invoice status update failed", invoiceError);
  }

  const invoice = await getOrderInvoiceAttachment(input.orderId);

  try {
    await sendOrderPaidEmails({
      locale: input.locale,
      orderCode: order.order_code || buildOrderCode(order.order_number),
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      totalCents: order.total_cents,
      currency: order.currency,
      paymentMethod: order.payment_method as OrderPaymentMethod,
      items: ((itemRows as Array<Record<string, unknown>> | null) ?? []).map((item) => ({
        name: String(item.product_name || "MDB Light product"),
        quantity: Number(item.quantity || 0),
        totalCents: Number(item.total_price_cents || 0),
        currency: order.currency,
        variantLines: [
          item.selected_color ? `Color: ${item.selected_color}` : "",
          item.selected_length ? `Length: ${item.selected_length}` : "",
          item.selected_material ? `Material: ${item.selected_material}` : "",
          ...Object.entries((item.selected_options as Record<string, string> | null) ?? {}).map(
            ([key, value]) => `${key}: ${value}`,
          ),
        ].filter(Boolean),
      })),
      invoiceAttachment: invoice?.attachment ?? null,
    });
  } catch (emailError) {
    console.error("Order paid email send failed", emailError);
  }

  return order;
}

export async function rollbackOrderCreation(orderId: string, cartId: string) {
  const storefront = createStorefrontServiceClient();
  await deleteOrderInvoice(orderId);
  await storefront.from("order_items").delete().eq("order_id", orderId);
  await storefront.from("orders").delete().eq("id", orderId);
  await storefront.from("carts").update({ status: "active" }).eq("id", cartId);
}
