import { ContactDetailLinks } from "@/components/ui/contact-links";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import type { Locale } from "@/i18n/config";
import { CONTACT_CITY } from "@/lib/contact-info";
import { companyInfoLabels, getLegalPageContent } from "@/lib/legal-content";

type LegalPageShellProps = {
  locale: Locale;
  page: "privacy" | "cookies" | "delivery" | "terms";
};

export function LegalPageShell({ locale, page }: LegalPageShellProps) {
  const content = getLegalPageContent(locale, page);
  const labels = companyInfoLabels[locale];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <SiteHeader topLabel="MDB Light" />

      <main className="min-h-[calc(100vh-220px)]">
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="rounded-[2rem] border border-[#e8dfd2] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d49a22]">
              MDB Light
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              {content.description}
            </p>
            <p className="mt-6 text-sm font-medium text-[color:var(--headline)]">
              {content.updatedLabel}: <span className="text-[color:var(--muted)]">{content.updatedAt}</span>
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {content.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.6rem] border border-[#e8dfd2] bg-white p-6 shadow-[0_18px_45px_rgba(27,42,74,0.04)]"
              >
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--headline)]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <section className="mt-6 rounded-[1.6rem] border border-[#e8dfd2] bg-[#fffaf4] p-6 shadow-[0_18px_45px_rgba(27,42,74,0.04)]">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--headline)]">
              MDB Group, SIA
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-3 sm:text-base">
              <p>
                <span className="font-medium text-[color:var(--headline)]">{labels.location}: </span>
                {CONTACT_CITY}
              </p>
              <ContactDetailLinks emailLabel={labels.email} phoneLabel={labels.phone} />
            </div>
          </section>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
