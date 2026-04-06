"use client";

import Image from "next/image";
import Link from "next/link";
import { AccountControls } from "@/components/ui/account-controls";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MobileScrollHeader } from "@/components/ui/mobile-scroll-header";
import { SiteNavigation } from "@/components/ui/site-navigation";

type SiteHeaderProps = {
  topLabel: string;
  topContact?: string;
};

export function SiteHeader({
  topLabel,
  topContact = "+371 24443333 · info@mdbgroup.lv",
}: SiteHeaderProps) {
  return (
    <>
      <div className="border-b border-[color:var(--line)] bg-white/85 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between gap-4 px-6 py-3 text-xs text-[color:var(--muted)] sm:px-10 lg:px-12">
          <div className="hidden md:block">{topContact}</div>
          <div className="w-full text-center md:ml-auto md:w-auto md:text-right">{topLabel}</div>
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
                className="h-15 w-auto object-contain xl:h-16"
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
            <div className="border-t border-[color:var(--line)] px-6 py-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo/mdb-light-logo.svg"
                  alt="MDB Light logo"
                  width={1080}
                  height={182}
                  priority
                  className="h-14 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="border-t border-[color:var(--line)] px-4 py-6">
              <div className="mx-auto flex max-w-7xl flex-col gap-4">
                <div className="grid grid-cols-[1.6fr_1fr] gap-4">
                  <SiteNavigation compact className="min-w-0" />
                  <LanguageSwitcher className="w-full justify-center" />
                </div>
                <div className="overflow-x-auto pb-1">
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
