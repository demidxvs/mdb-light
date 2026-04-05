import type { Locale } from "@/i18n/config";

const PASSWORD_DIFFERENT_ERROR = "New password should be different from the old password.";

const passwordDifferentCopy: Record<Locale, string> = {
  en: "Your new password must be different from the current one.",
  ru: "Новый пароль должен отличаться от текущего.",
  el: "Ο νέος κωδικός πρέπει να διαφέρει από τον τρέχοντα.",
  lv: "Jaunajai parolei jāatšķiras no pašreizējās.",
};

export function translateAuthError(message: string | null | undefined, locale: Locale) {
  if (!message) {
    return "";
  }

  if (message === PASSWORD_DIFFERENT_ERROR) {
    return passwordDifferentCopy[locale];
  }

  return message;
}
