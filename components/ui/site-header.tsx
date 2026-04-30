"use client";

import Image from "next/image";
import Link from "next/link";
import { AccountControls } from "@/components/ui/account-controls";
import { ContactInlineLinks } from "@/components/ui/contact-links";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MobileScrollHeader } from "@/components/ui/mobile-scroll-header";
import { SiteNavigation } from "@/components/ui/site-navigation";

type SiteHeaderProps = {
  topLabel: string;
};

export function SiteHeader({ topLabel }: SiteHeaderProps) {
  const resolvedTopLabel = topLabel.trim() || "Multilingual LED marketplace";

  return (
    <>
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-2 text-xs text-[color:var(--muted)] sm:px-10 sm:py-3 lg:px-12">
          <ContactInlineLinks className="hidden md:block" />
          <div className="w-full text-right md:ml-auto md:w-auto">{resolvedTopLabel}</div>
        </div>
      </div>

      <MobileScrollHeader>
        <header className="border-b border-[color:var(--line)] bg-white/92 backdrop-blur-xl">
          <div className="mx-auto hidden max-w-[1180px] items-center justify-between gap-8 px-6 py-4 lg:flex lg:px-10 xl:px-12">
            <Link href="/" className="flex shrink-0 items-center">
              <Image
                src="/logo/mdb-light-logo.svg"
                alt="MDB Light logo"
                width={1080}
                height={182}
                priority
                className="h-16 w-auto object-contain xl:h-[4.5rem]"
              />
            </Link>
            <div className="ml-auto">
              <SiteNavigation />
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <AccountControls />
            </div>
          </div>

          <div className="lg:hidden">
            <div className="border-t border-[color:var(--line)] px-5 py-2.5">
              <Link href="/" className="flex items-center justify-center">
                <Image
                  src="/logo/mdb-light-logo.svg"
                  alt="MDB Light logo"
                  width={1080}
                  height={182}
                  priority
                  className="h-9 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="border-t border-[color:var(--line)] px-3 py-2">
              <div className="mx-auto flex max-w-7xl flex-col gap-2">
                <div className="flex items-stretch gap-2">
                  <SiteNavigation compact className="w-[13rem] min-w-0" />
                  <LanguageSwitcher compact className="w-[9.25rem] justify-center" />
                </div>
                <div className="-my-2 overflow-x-auto py-2">
                  <AccountControls compact />
                </div>
              </div>
            </div>
          </div>
        </header>
      </MobileScrollHeader>
    </>
  );
}
