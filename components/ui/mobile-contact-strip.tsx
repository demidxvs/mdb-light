import { Mail, Phone } from "lucide-react";

type MobileContactStripProps = {
  email?: string;
  phone?: string;
};

export function MobileContactStrip({
  email = "info@mdblight.com",
  phone = "+371 24443333",
}: MobileContactStripProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ece3d9] bg-[#fffaf4] p-3 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        className="inline-flex min-w-0 items-center gap-2 font-medium text-[color:var(--headline)] transition hover:text-[color:var(--muted)]"
      >
        <Phone className="h-4 w-4 shrink-0" />
        <span className="truncate">{phone}</span>
      </a>
      <a
        href={`mailto:${email}`}
        className="inline-flex min-w-0 items-center gap-2 font-medium text-[color:var(--headline)] transition hover:text-[color:var(--muted)]"
      >
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate">{email}</span>
      </a>
    </div>
  );
}
