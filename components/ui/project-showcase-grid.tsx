"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import type { ProjectShowcaseItem } from "@/lib/mock-project-showcase";

type ProjectShowcaseGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: ProjectShowcaseItem[];
  sectionId?: string;
  limit?: number;
  loading?: boolean;
};

export function ProjectShowcaseGrid({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  items,
  sectionId,
  limit,
  loading = false,
}: ProjectShowcaseGridProps) {
  const { locale } = useLocale();
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;
  const [activeImage, setActiveImage] = useState<ProjectShowcaseItem | null>(null);
  const skeletonItems = useMemo(() => Array.from({ length: limit ?? 4 }), [limit]);

  return (
    <>
      <section id={sectionId} className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
        <div className="flex flex-col gap-5 border-b border-[#efe6dd] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">{eyebrow}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{description}</p>
          </div>
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f4c64f] px-5 text-sm font-semibold text-[#1e2f4e] shadow-[0_14px_28px_rgba(244,198,79,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {loading
              ? skeletonItems.map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="aspect-[1.02/1] overflow-hidden rounded-[1.6rem] border border-[#e9e0d3] bg-[linear-gradient(135deg,#f9f4ec_0%,#f2e9dc_48%,#f8f4ee_100%)] shadow-[0_16px_38px_rgba(27,42,74,0.04)]"
                  />
                ))
              : visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveImage(item)}
                    className="group block text-left"
                  >
                    <article className="overflow-hidden rounded-[1.6rem] border border-[#e9e0d3] bg-[#fffaf4] shadow-[0_16px_38px_rgba(27,42,74,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(27,42,74,0.1)]">
                      <div className="relative aspect-[1.02/1] overflow-hidden bg-[#f4efe7]">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.title[locale]}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className={`absolute inset-0 ${item.palette}`} />
                        )}
                      </div>
                    </article>
                  </button>
                ))}
          </div>
        </div>
      </section>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,14,22,0.82)] p-5 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title[locale]}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white transition hover:bg-white/16"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111827] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            {activeImage.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title[locale]}
                className="max-h-[88vh] w-full object-contain"
              />
            ) : (
              <div className={`aspect-[16/10] w-full ${activeImage.palette}`} />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
