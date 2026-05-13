import type { Locale } from "@/i18n/config";

const PASSWORD_DIFFERENT_ERROR = "New password should be different from the old password.";
const NETWORK_ERROR_MESSAGES = new Set([
  "Load failed",
  "Failed to fetch",
  "fetch failed",
  "NetworkError when attempting to fetch resource.",
]);

const passwordDifferentCopy: Record<Locale, string> = {
  en: "Your new password must be different from the current one.",
  ru: "Новый пароль должен отличаться от текущего.",
  el: "Ο νέος κωδικός πρέπει να διαφέρει από τον τρέχοντα.",
  lv: "Jaunajai parolei jāatšķiras no pašreizējās.",
};

const networkErrorCopy: Record<Locale, string> = {
  en: "Admin authentication is unreachable. Check the admin Supabase project URL and publishable key.",
  ru: "Сервис входа в админку недоступен. Проверьте URL admin Supabase проекта и publishable key.",
  el: "Η σύνδεση στο admin δεν είναι διαθέσιμη. Ελέγξτε το URL του admin Supabase project και το publishable key.",
  lv: "Admin pieslēgšanās serviss nav sasniedzams. Pārbaudiet admin Supabase projekta URL un publishable key.",
};

export function translateAuthError(message: string | null | undefined, locale: Locale) {
  if (!message) {
    return "";
  }

  if (message === PASSWORD_DIFFERENT_ERROR) {
    return passwordDifferentCopy[locale];
  }

  if (NETWORK_ERROR_MESSAGES.has(message)) {
    return networkErrorCopy[locale];
  }

  return message;
}
