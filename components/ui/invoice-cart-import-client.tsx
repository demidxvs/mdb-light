"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { replaceGuestCartItems } from "@/lib/cart";

const copy = {
  en: {
    loading: "Preparing your cart...",
    error: "Could not prepare this cart link.",
  },
  ru: {
    loading: "Подготавливаем вашу корзину...",
    error: "Не удалось подготовить корзину по этой ссылке.",
  },
  el: {
    loading: "Προετοιμάζουμε το καλάθι σας...",
    error: "Δεν ήταν δυνατή η προετοιμασία του καλαθιού από αυτόν τον σύνδεσμο.",
  },
  lv: {
    loading: "Sagatavojam jūsu grozu...",
    error: "Neizdevās sagatavot grozu no šīs saites.",
  },
} as const;

export function InvoiceCartImportClient({ token }: { token: string }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch("/api/cart/invoice-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          mode?: "guest" | "authenticated";
          items?: Parameters<typeof replaceGuestCartItems>[0];
        };

        if (!response.ok) {
          throw new Error(payload.error || t.error);
        }

        if (payload.mode === "guest" && payload.items) {
          replaceGuestCartItems(payload.items);
        }

        if (!cancelled) {
          router.replace(localizePathname("/cart", locale));
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : t.error);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [locale, router, t.error, token]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[720px] items-center justify-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-[#ece3d9] bg-white p-8 text-center shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <div className="flex flex-col items-center gap-4 text-sm text-[color:var(--muted)]">
            <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--headline)]" />
            <p>{t.loading}</p>
          </div>
        )}
      </div>
    </main>
  );
}
