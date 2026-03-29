import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function CollectionsPage() {
  return (
    <MarketingPageShell
      eyebrow="Collections"
      title="New lighting collections are coming here."
      description="This page will showcase featured launches, seasonal ranges, and curated product selections from the MDB Light marketplace."
      primaryLabel="Open catalog"
      primaryHref="/catalog"
      secondaryLabel="Explore ideas"
      secondaryHref="/projects"
    />
  );
}
