import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function SecurityPage() {
  return (
    <MarketingPageShell
      eyebrow="Security"
      title="Security and privacy information."
      description="This page will explain account protection, access rules, order safety, privacy handling, and admin access principles."
      primaryLabel="Open login"
      primaryHref="/login"
      secondaryLabel="Back to home"
      secondaryHref="/"
    />
  );
}
