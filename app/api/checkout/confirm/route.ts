import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { markOrderPaid } from "@/lib/order-service";
import { getStripeServerClient, isStripeConfigured } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ConfirmBody = {
  sessionId?: string;
};

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ConfirmBody;
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.object !== "checkout.session") {
      return NextResponse.json({ error: "Stripe session not found." }, { status: 404 });
    }

    const orderId = session.metadata?.order_id?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "Missing order metadata." }, { status: 400 });
    }

    const customerEmail = session.metadata?.customer_email?.trim();
    if (customerEmail && user.email && customerEmail !== user.email) {
      return NextResponse.json(
        { error: "This checkout session does not belong to the current user." },
        { status: 403 },
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment is not completed yet.", paymentStatus: session.payment_status },
        { status: 409 },
      );
    }

    const order = await markOrderPaid({
      orderId,
      locale: isLocale(session.metadata?.locale) ? session.metadata.locale : "en",
      paymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });

    return NextResponse.json({
      ok: true,
      orderId: order?.id ?? null,
      orderNumber: order?.order_number ?? null,
      orderCode: order?.order_code ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm checkout." },
      { status: 500 },
    );
  }
}
