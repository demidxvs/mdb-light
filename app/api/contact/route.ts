import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact-mail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      phone?: unknown;
      subject?: unknown;
      message?: unknown;
    };

    const email = normalizeText(body.email);
    const phone = normalizeText(body.phone);
    const subject = normalizeText(body.subject);
    const message = normalizeText(body.message);

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await sendContactEmail({ email, phone, subject, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send failed", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
