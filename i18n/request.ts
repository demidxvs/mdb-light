import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLocale = headerStore.get("x-mdb-locale");
  const cookieLocale = cookieStore.get("mdb-light-locale")?.value;
  const locale = isLocale(headerLocale)
    ? headerLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;

  return {
    locale,
    timeZone: "Europe/Riga",
    messages: getMessages(locale),
  };
});
