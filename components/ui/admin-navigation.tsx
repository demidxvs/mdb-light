"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname, stripLocalePrefix } from "@/i18n/config";

const adminRoot = "/panel-x9k2m4q7r2a";

const copy = {
  en: {
    home: "Admin home",
    categories: "Categories",
    catalog: "Products",
    attributes: "Attributes",
    carts: "Carts",
    promoCodes: "Promo codes",
    orders: "Orders",
    invoices: "Invoice Builder",
    projects: "Projects",
    users: "Users",
    addProduct: "Add product",
  },
  ru: {
    home: "Главная админки",
    categories: "Категории",
    catalog: "Товары",
    attributes: "Характеристики",
    carts: "Корзины",
    promoCodes: "Промокоды",
    orders: "Заказы",
    invoices: "Создание счета",
    projects: "Проекты",
    users: "Пользователи",
    addProduct: "Добавить товар",
  },
  el: {
    home: "Αρχική admin",
    categories: "Κατηγορίες",
    catalog: "Προϊόντα",
    attributes: "Χαρακτηριστικά",
    carts: "Καλάθια",
    promoCodes: "Promo codes",
    orders: "Παραγγελίες",
    invoices: "Invoice Builder",
    projects: "Έργα",
    users: "Χρήστες",
    addProduct: "Προσθήκη προϊόντος",
  },
  lv: {
    home: "Admin sākums",
    categories: "Kategorijas",
    catalog: "Produkti",
    attributes: "Raksturlielumi",
    carts: "Grozi",
    promoCodes: "Promo kodi",
    orders: "Pasūtījumi",
    invoices: "Rēķinu veidošana",
    projects: "Projekti",
    users: "Lietotāji",
    addProduct: "Pievienot produktu",
  },
} as const;

const links = [
  { href: adminRoot, key: "home" },
  { href: adminRoot + "/categories", key: "categories" },
  { href: adminRoot + "/catalog", key: "catalog" },
  { href: adminRoot + "/attributes", key: "attributes" },
  { href: adminRoot + "/carts", key: "carts" },
  { href: adminRoot + "/promo-codes", key: "promoCodes" },
  { href: adminRoot + "/orders", key: "orders" },
  { href: adminRoot + "/invoices", key: "invoices" },
  { href: adminRoot + "/projects", key: "projects" },
  { href: adminRoot + "/users", key: "users" },
  { href: adminRoot + "/catalog/new", key: "addProduct" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-[1.35rem] border border-[#ece3d9] bg-white/82 p-2 shadow-none">
      {links.map((link) => {
        const isActive = stripLocalePrefix(pathname || "/") === link.href;
        const className = isActive
          ? "inline-flex h-10 shrink-0 items-center rounded-[1rem] bg-[#7f8eab] px-3.5 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(127,142,171,0.28)] transition duration-300"
          : "inline-flex h-10 shrink-0 items-center rounded-[1rem] px-3.5 text-[13px] font-medium text-[color:var(--muted)] transition duration-300 hover:bg-[#f5efe6] hover:text-[color:var(--headline)]";

        return (
          <Link key={link.href} href={localizePathname(link.href, locale)} className={className}>
            {t[link.key]}
          </Link>
        );
      })}
    </nav>
  );
}
