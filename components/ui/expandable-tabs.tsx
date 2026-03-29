"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement | null>(null);

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLElement>, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] shrink-0 bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-nowrap items-center gap-2 overflow-x-auto rounded-2xl border bg-background p-1 shadow-sm",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;

        return (
          <button
            key={tab.title}
            type="button"
            onClick={() => handleSelect(index)}
            className={cn(
              "relative flex h-12 shrink-0 items-center rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,padding,gap] duration-500 ease-out",
              isSelected
                ? cn("gap-2 bg-muted px-4", activeColor)
                : "gap-0 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={20} />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-500 ease-out",
                isSelected ? "ml-2 max-w-[140px] opacity-100" : "ml-0 max-w-0 opacity-0",
              )}
            >
              {tab.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

