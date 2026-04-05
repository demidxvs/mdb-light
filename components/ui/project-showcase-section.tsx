"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectShowcaseGrid } from "@/components/ui/project-showcase-grid";
import {
  featuredMockProjectShowcase,
  mockProjectShowcase,
  type ProjectShowcaseItem,
} from "@/lib/mock-project-showcase";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

type ProjectRow = {
  id: string;
  slug: string;
  cover_image_url: string | null;
  is_featured_home: boolean;
};

type ProjectShowcaseSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  sectionId?: string;
  limit?: number;
  homeOnly?: boolean;
};

const fallbackPalettes = [
  "bg-[radial-gradient(circle_at_top,rgba(255,232,176,0.55),transparent_34%),linear-gradient(135deg,#26314f_0%,#475a82_42%,#f2d093_100%)]",
  "bg-[radial-gradient(circle_at_80%_20%,rgba(255,245,212,0.45),transparent_30%),linear-gradient(135deg,#17233b_0%,#314566_45%,#d7b87b_100%)]",
  "bg-[radial-gradient(circle_at_50%_18%,rgba(255,214,140,0.48),transparent_26%),linear-gradient(135deg,#2a2230_0%,#554463_48%,#f2bc66_100%)]",
  "bg-[radial-gradient(circle_at_72%_24%,rgba(255,250,228,0.46),transparent_28%),linear-gradient(135deg,#1d293f_0%,#4c5b78_44%,#efe4c8_100%)]",
] as const;

function getProjectCacheKey(homeOnly: boolean, limit?: number) {
  return `mdb-project-showcase-${homeOnly ? "home" : "all"}-${limit ?? "all"}`;
}

function readCachedItems(homeOnly: boolean, limit?: number) {
  if (typeof window === "undefined") return [];

  try {
    const cached = window.sessionStorage.getItem(getProjectCacheKey(homeOnly, limit));
    if (!cached) return [];

    const parsed = JSON.parse(cached) as { items?: ProjectShowcaseItem[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

export function ProjectShowcaseSection({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  sectionId,
  limit,
  homeOnly = false,
}: ProjectShowcaseSectionProps) {
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const fallbackItems = homeOnly ? featuredMockProjectShowcase : mockProjectShowcase;
  const [items, setItems] = useState<ProjectShowcaseItem[]>(
    supabaseReady ? [] : fallbackItems,
  );
  const [loading, setLoading] = useState(supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      const cachedItems = readCachedItems(homeOnly, limit);

      if (!mounted) return;

      if (cachedItems.length > 0) {
        setItems(cachedItems);
        setLoading(false);
      } else {
        setLoading(true);
      }

      let query = supabase
        .from("projects")
        .select("id, slug, cover_image_url, is_featured_home")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (homeOnly) {
        query = query.eq("is_featured_home", true).limit(limit ?? 4);
      }

      const { data, error } = await query;
      if (!mounted) return;
      if (error || !data || data.length === 0) {
        setItems(fallbackItems);
        setLoading(false);
        return;
      }

      const mapped = (data as ProjectRow[]).map((item, index) => ({
          id: item.id,
          slug: item.slug,
          imageUrl: item.cover_image_url,
          featuredOnHome: item.is_featured_home,
          palette: fallbackPalettes[index % fallbackPalettes.length],
          title: {
            en: item.slug,
            ru: item.slug,
            el: item.slug,
            lv: item.slug,
          },
          caption: {
            en: "",
            ru: "",
            el: "",
            lv: "",
          },
        } satisfies ProjectShowcaseItem));

      setItems(mapped);
      setLoading(false);

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            getProjectCacheKey(homeOnly, limit),
            JSON.stringify({ items: mapped }),
          );
        } catch {
          // Ignore cache write failures.
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [fallbackItems, homeOnly, limit, supabaseReady]);

  return (
    <ProjectShowcaseGrid
      sectionId={sectionId}
      eyebrow={eyebrow}
      title={title}
      description={description}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      items={items}
      limit={limit}
      loading={loading}
    />
  );
}
