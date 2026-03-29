import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function CatalogPage() {
  return (
    <MarketingPageShell
      eyebrow="Catalog"
      title="Product catalog is the next build step."
      description="This page will become the real storefront with categories, filters, cards, and multilingual product content."
      primaryLabel="Open projects"
      primaryHref="/projects"
      secondaryLabel="Back to home"
      secondaryHref="/"
    />
  );
}
