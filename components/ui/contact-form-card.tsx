"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "@/components/ui/locale-provider";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactFormState = {
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

const initialState: ContactFormState = {
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactFormCard() {
  const t = useTranslations("home.contactForm");
  const { locale } = useLocale();
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phoneLabel =
    locale === "ru"
      ? "Телефон"
      : locale === "el"
        ? "Τηλέφωνο"
        : locale === "lv"
          ? "Tālrunis"
          : "Phone number";

  const phonePlaceholder = "+371 2XXXXXXX";

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));

    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  };

  const validate = () => {
    const nextErrors: ContactFormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = t("errors.emailRequired");
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = t("errors.emailInvalid");
    }

    if (!form.subject.trim()) {
      nextErrors.subject = t("errors.subjectRequired");
    }

    if (!form.message.trim()) {
      nextErrors.message = t("errors.messageRequired");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      setForm(initialState);
      setErrors({});
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div id="support" className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 sm:p-8 lg:min-h-[520px]">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">{t("label")}</p>
      <h2 className="font-display mt-3 max-w-[24rem] text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
        {t("title")}
      </h2>
      <p className="mt-4 max-w-[30rem] text-sm leading-8 text-[color:var(--muted)] sm:text-base">{t("description")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-[color:var(--headline)]">
            {t("fields.email")}
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder={t("placeholders.email")}
            className={`h-12 w-full rounded-2xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${
              errors.email ? "border-red-300" : "border-[#ece3d9]"
            }`}
          />
          {errors.email ? <p className="mt-2 text-xs text-red-500">{errors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-[color:var(--headline)]">
            <span suppressHydrationWarning>{mounted ? phoneLabel : ""}</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder={mounted ? phonePlaceholder : ""}
            className="h-12 w-full rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-[color:var(--headline)]">
            {t("fields.subject")}
          </label>
          <input
            id="contact-subject"
            type="text"
            value={form.subject}
            onChange={(event) => handleChange("subject", event.target.value)}
            placeholder={t("placeholders.subject")}
            className={`h-12 w-full rounded-2xl border bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)] ${
              errors.subject ? "border-red-300" : "border-[#ece3d9]"
            }`}
          />
          {errors.subject ? <p className="mt-2 text-xs text-red-500">{errors.subject}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-[color:var(--headline)]">
            {t("fields.message")}
          </label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => handleChange("message", event.target.value)}
            placeholder={t("placeholders.message")}
            rows={6}
            className={`w-full rounded-2xl border bg-[#fffcf7] px-4 py-3 outline-none transition focus:border-[color:var(--accent)] ${
              errors.message ? "border-red-300" : "border-[#ece3d9]"
            }`}
          />
          {errors.message ? <p className="mt-2 text-xs text-red-500">{errors.message}</p> : null}
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {t("success")}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t("error")}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-14 min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e] hover:shadow-[0_18px_34px_rgba(244,198,79,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              {t("submit")}
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
