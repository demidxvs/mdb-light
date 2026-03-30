"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/ui/locale-provider";

const adminRoot = "/panel-x9k2m4q7r2a";

const copy = {
  en: {
    home: "Admin home",
    categories: "Categories",
    catalog: "Products",
    users: "Users",
    addProduct: "Add product",
  },
  ru: {
    home: "Главная админки",
    categories: "Категории",
    catalog: "Товары",
    users: "Пользователи",
    addProduct: "Добавить товар",
  },
  el: {
    home: "Αρχική admin",
    categories: "Κατηγορίες",
    catalog: "Προϊόντα",
    users: "Χρήστες",
    addProduct: "Προσθήκη προϊόντος",
  },
  lv: {
    home: "Admin sākums",
    categories: "Kategorijas",
    catalog: "Produkti",
    users: "Lietotāji",
    addProduct: "Pievienot produktu",
  },
} as const;

const links = [
  { href: adminRoot, key: "home" },
  { href: adminRoot + "/categories", key: "categories" },
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
