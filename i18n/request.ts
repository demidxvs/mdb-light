import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("mdb-light-locale")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
  };
});
