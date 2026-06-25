import { NextResponse } from "next/server";
import { normalizeDiscountPercent, normalizePromoCode } from "@/lib/pricing.mjs";
import {
  createStorefrontServiceClient,
  requireAdminUser,
} from "@/lib/storefront-admin-server";

type PromoCodePayload = {
  code?: string;
  discountPercent?: number;
};

export async function GET() {
  const { user, response } = await requireAdminUser();
  if (response) return response;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront
      .from("promo_codes")
      .select("code, discount_percent, created_at, created_by")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      promoCodes: data ?? [],
      adminId: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load promo codes" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireAdminUser();
  if (response) return response;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json().catch(() => ({}))) as PromoCodePayload;
    const code = normalizePromoCode(body.code);
    const discountPercent = normalizeDiscountPercent(body.discountPercent);

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    if (discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json({ error: "Discount must be from 1 to 100 percent" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { data, error } = await storefront
      .from("promo_codes")
      .upsert(
        {
          code,
          discount_percent: discountPercent,
          created_by: user.id,
        },
        { onConflict: "code" },
      )
      .select("code, discount_percent, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to save promo code" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, promoCode: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save promo code" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminUser();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as PromoCodePayload;
    const code = normalizePromoCode(body.code);

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const storefront = createStorefrontServiceClient();
    const { error } = await storefront
      .from("promo_codes")
      .delete()
      .eq("code", code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete promo code" },
      { status: 500 },
    );
  }
}
