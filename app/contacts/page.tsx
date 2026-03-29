import { MarketingPageShell } from "@/components/ui/marketing-page-shell";

export default function ContactsPage() {
  return (
    <MarketingPageShell
      eyebrow="Contacts"
      title="Contact page for customers and partners."
      description="This page will contain contact details, request forms, office info, and support channels for MDB Light."
      primaryLabel="Open catalog"
      primaryHref="/catalog"
      secondaryLabel="Back to home"
      secondaryHref="/"
    />
  );
}
