import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function ProjectsPage() {
  return (
    <MarketingPageShell
      eyebrow="Projects"
      title="Lighting ideas and project scenarios."
      description="This page will collect residential, retail, horeca, and commercial lighting references for shoppers and partners."
      primaryLabel="Open catalog"
      primaryHref="/catalog"
      secondaryLabel="Back to home"
      secondaryHref="/"
    />
  );
}
