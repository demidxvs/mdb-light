import type {AbstractIntlMessages} from "next-intl";
import type {Locale} from "@/i18n/config";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import el from "@/messages/el.json";
import lv from "@/messages/lv.json";

const messagesByLocale: Record<Locale, AbstractIntlMessages> = {
  en,
  ru,
  el,
  lv,
};

export function getMessages(locale: Locale): AbstractIntlMessages {
  return messagesByLocale[locale];
}
