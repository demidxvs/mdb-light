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
    <Link href={href} className="block h-full min-w-0">
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#ece3d9] bg-white shadow-[0_10px_24px_rgba(27,42,74,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(27,42,74,0.1)] sm:rounded-[1.5rem] sm:shadow-[0_16px_36px_rgba(27,42,74,0.06)]">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] sm:aspect-[4/3]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 50vw, 25vw"
              priority={imageLoading === "eager"}
              fetchPriority={imageFetchPriority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,rgba(244,198,79,0.18),transparent_42%),linear-gradient(180deg,#fffdfa_0%,#f3ede4_100%)] text-[#a6b0c2] sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ece3d9] bg-white/80 sm:h-14 sm:w-14 sm:rounded-2xl">
                <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <p className="hidden px-3 text-center text-xs uppercase text-[#9c8b6b] sm:block">
                {placeholder}
              </p>
            </div>
          )}
          <div className="absolute right-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/92 px-2 py-1 text-[10px] font-semibold text-[#1f3255] shadow-[0_8px_18px_rgba(27,42,74,0.08)] sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
            {price}
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-2 bg-[#fffdfa] p-3 sm:space-y-3 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-center justify-between gap-1 sm:gap-3">
            <p className="min-w-0 truncate text-[9px] uppercase leading-4 text-[#aa9466] sm:text-[10px]">{category || "\u00a0"}</p>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#9babc7] transition duration-300 group-hover:text-[#1f3255] sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            {sku ? <p className="truncate text-[10px] font-medium uppercase leading-4 text-[#8c9bb6] sm:text-xs">{sku}</p> : null}
            <h3 className="mt-1 line-clamp-3 min-h-[3.75rem] break-words font-display text-sm font-semibold leading-5 text-[color:var(--headline)] sm:mt-2 sm:min-h-0 sm:text-[1.15rem] sm:leading-6">
              {name}
            </h3>
            <p className="mt-3 hidden min-h-[48px] text-sm leading-6 text-[color:var(--muted)] sm:block">{teaser}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
