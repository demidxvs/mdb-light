import { NextResponse } from "next/server";
import { getOrderByCodeForUser } from "@/lib/order-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const orderCode = requestUrl.searchParams.get("order")?.trim();

    if (!orderCode) {
      return NextResponse.json({ error: "Missing order code." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await getOrderByCodeForUser(orderCode, user.id);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load order." },
      { status: 500 },
    );
  }
}
