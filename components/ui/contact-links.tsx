"use client";

import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/lib/contact-info";

export function ContactInlineLinks({
  className = "",
  separator = " · ",
}: {
  className?: string;
  separator?: string;
}) {
  return (
    <div className={className}>
      <a href={CONTACT_PHONE_HREF} className="transition hover:text-[color:var(--headline)]">
        {CONTACT_PHONE}
      </a>
      <span>{separator}</span>
      <a href={CONTACT_EMAIL_HREF} className="transition hover:text-[color:var(--headline)]">
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}

export function ContactDetailLinks({
  emailLabel,
  phoneLabel,
}: {
  emailLabel: string;
  phoneLabel: string;
}) {
  return (
    <>
      <p>
        <span className="font-medium text-[color:var(--headline)]">{emailLabel}: </span>
        <a href={CONTACT_EMAIL_HREF} className="transition hover:text-[color:var(--headline)]">
          {CONTACT_EMAIL}
        </a>
      </p>
      <p>
        <span className="font-medium text-[color:var(--headline)]">{phoneLabel}: </span>
        <a href={CONTACT_PHONE_HREF} className="transition hover:text-[color:var(--headline)]">
          {CONTACT_PHONE}
        </a>
      </p>
    </>
  );
}
