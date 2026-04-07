import { ContactDetailLinks } from "@/components/ui/contact-links";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { CONTACT_CITY } from "@/lib/contact-info";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <SiteHeader topLabel="Multilingual LED marketplace" />
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-8 lg:px-10">
        <div className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_20px_50px_rgba(27,42,74,0.06)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">Contacts</p>
          <h1 className="mt-3 font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-[3rem]">
            Contact MDB Light
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            Reach out for product selection, lighting installation, order support, or partnership requests.
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-[#ece3d9] bg-[#fffaf4] p-5 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            <p>
              <span className="font-medium text-[color:var(--headline)]">Location: </span>
              {CONTACT_CITY}
            </p>
            <ContactDetailLinks emailLabel="Email" phoneLabel="Phone" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
