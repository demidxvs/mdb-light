import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function LightingPage() {
  return (
    <MarketingPageShell
      eyebrow="Lighting types"
      title="Indoor and outdoor lighting directions."
      description="This page will separate residential interior lighting, facade lighting, outdoor fixtures, and application-based product groupings."
      primaryLabel="Open catalog"
      primaryHref="/catalog"
      secondaryLabel="Back to home"
      secondaryHref="/"
    />
  );
}
