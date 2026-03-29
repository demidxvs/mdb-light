import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type MarketingPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: MarketingPageShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 py-2 text-sm font-medium text-[color:var(--headline)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <section className="mt-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_20px_50px_rgba(27,42,74,0.06)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">{eyebrow}</p>
          <h1 className="font-display mt-3 text-[2.2rem] font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-[3rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#efbf3e]"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-xl border border-[#ece3d9] bg-[#fffaf4] px-6 text-sm font-semibold text-[color:var(--headline)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/25"
            >
              {secondaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
