"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/ui/locale-provider";

const adminRoot = "/panel-x9k2m4q7r2a";

const copy = {
  en: {
    home: "Admin home",
    catalog: "Catalog",
    users: "Users",
    addProduct: "Add product",
  },
  ru: {
    home: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u0430\u0434\u043c\u0438\u043d\u043a\u0438",
    catalog: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433",
    users: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
    addProduct: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440",
  },
  el: {
    home: "\u0391\u03c1\u03c7\u03b9\u03ba\u03ae admin",
    catalog: "\u039a\u03b1\u03c4\u03ac\u03bb\u03bf\u03b3\u03bf\u03c2",
    users: "\u03a7\u03c1\u03ae\u03c3\u03c4\u03b5\u03c2",
    addProduct: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03bf\u03c2",
  },
  lv: {
    home: "Admin s\u0101kums",
    catalog: "Katalogs",
    users: "Lietot\u0101ji",
    addProduct: "Pievienot produktu",
  },
} as const;

const links = [
  { href: adminRoot, key: "home" },
  { href: adminRoot + "/catalog", key: "catalog" },
  { href: adminRoot + "/users", key: "users" },
  { href: adminRoot + "/catalog/new", key: "addProduct" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto rounded-[1.5rem] border border-[#ece3d9] bg-white/82 p-2 shadow-none">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const className = isActive
          ? "inline-flex h-11 shrink-0 items-center rounded-[1.1rem] bg-[#7f8eab] px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(127,142,171,0.28)] transition duration-300"
          : "inline-flex h-11 shrink-0 items-center rounded-[1.1rem] px-4 text-sm font-medium text-[color:var(--muted)] transition duration-300 hover:bg-[#f5efe6] hover:text-[color:var(--headline)]";

        return (
          <Link key={link.href} href={link.href} className={className}>
            {t[link.key]}
          </Link>
        );
      })}
    </nav>
  );
}
