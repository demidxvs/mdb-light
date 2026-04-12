"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";

type CatalogProductCardProps = {
  href?: string;
  name: string;
  teaser: string;
  sku?: string;
  price: string;
  category?: string;
  imageUrl?: string | null;
  imageLoading?: "eager" | "lazy";
  imageFetchPriority?: "high" | "low" | "auto";
};

export function CatalogProductCard({
  href = "/catalog",
  name,
  teaser,
  sku,
  price,
  category,
  imageUrl,
  imageLoading = "lazy",
  imageFetchPriority,
}: CatalogProductCardProps) {
  const { locale } = useLocale();
  const placeholder =
    locale === "ru"
      ? "Фото можно добавить в админке"
      : locale === "el"
        ? "Η φωτογραφία προστίθεται από το admin"
        : locale === "lv"
          ? "Foto var pievienot admin panelī"
          : "Photo can be added in admin";

  return (
    <Link href={href} className="block">
      <article className="group overflow-hidden rounded-[1.5rem] border border-[#ece3d9] bg-white shadow-[0_16px_36px_rgba(27,42,74,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(27,42,74,0.1)]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
              priority={imageLoading === "eager"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(244,198,79,0.18),transparent_42%),linear-gradient(180deg,#fffdfa_0%,#f3ede4_100%)] text-[#a6b0c2]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ece3d9] bg-white/80">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-center text-xs uppercase tracking-[0.22em] text-[#9c8b6b]">
                {placeholder}
              </p>
            </div>
          )}
          <div className="absolute right-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#1f3255] shadow-[0_10px_20px_rgba(27,42,74,0.08)]">
            {price}
          </div>
        </div>

        <div className="space-y-3 bg-[#fffdfa] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#aa9466]">{category || "\u00a0"}</p>
            <ArrowUpRight className="h-4 w-4 text-[#9babc7] transition duration-300 group-hover:text-[#1f3255]" />
          </div>
          <div>
            {sku ? <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8c9bb6]">{sku}</p> : null}
            <h3 className="mt-2 font-display text-[1.15rem] font-semibold leading-6 text-[color:var(--headline)]">
              {name}
            </h3>
            <p className="mt-3 min-h-[48px] text-sm leading-6 text-[color:var(--muted)]">{teaser}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
