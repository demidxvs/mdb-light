import { NextResponse } from "next/server";
import { normalizePromoCode } from "@/lib/pricing.mjs";
import { createStorefrontServiceClient } from "@/lib/storefront-admin-server";

type PromoValidatePayload = {
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as PromoValidatePayload;
    const code = normalizePromoCode(body.code);

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront
      .from("promo_codes")
      .select("code, discount_percent")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    return NextResponse.json({
      promoCode: {
        code: data.code,
        discountPercent: Number(data.discount_percent) || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate promo code" },
      { status: 500 },
    );
  }
}
