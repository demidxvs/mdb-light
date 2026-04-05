import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isLocale } from "@/i18n/config";
import { markOrderPaid } from "@/lib/order-service";
import { getStripeServerClient } from "@/lib/stripe";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  return secret;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripeServerClient();
    const event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid" && session.metadata?.order_id) {
        await markOrderPaid({
          orderId: session.metadata.order_id,
          locale: isLocale(session.metadata?.locale) ? session.metadata.locale : "en",
          paymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process Stripe webhook.",
      },
      { status: 400 },
    );
  }
}
