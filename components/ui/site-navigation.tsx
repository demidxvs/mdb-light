"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FolderOpen,
  Handshake,
  HelpCircle,
  Lightbulb,
  Search,
  Shield,
} from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

const sectionIds = ["catalog", "about", "partners", "projects"];
const routePaths = ["/contacts", "/security"];

type SiteNavigationProps = {
  basePath?: string;
};

export function SiteNavigation({ basePath }: SiteNavigationProps) {
  const router = useRouter();
  const t = useTranslations("navigation");
  const tabs = React.useMemo(
    () => [
      { title: t("catalog"), icon: Search },
      { title: t("about"), icon: Lightbulb },
      { title: t("partners"), icon: Handshake },
      { title: t("projects"), icon: FolderOpen },
      { type: "separator" as const },
      { title: t("support"), icon: HelpCircle },
      { title: t("security"), icon: Shield },
    ],
    [t],
  );

  const handleChange = React.useCallback(
    (index: number | null) => {
      if (index === null) {
        return;
      }

      if (tabs[index]?.type === "separator") {
        return;
      }

      if (index >= 5) {
        router.push(routePaths[index - 5]);
        return;
      }

      const sectionId = sectionIds[index];
      if (basePath) {
        router.push(`${basePath}#${sectionId}`);
        return;
      }

      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [basePath, router, tabs],
  );

  return (
    <ExpandableTabs
      tabs={tabs}
      onChange={handleChange}
      activeColor="text-[color:var(--headline)]"
      className="border-[#ece3d9] bg-white/82 shadow-none"
    />
  );
}
