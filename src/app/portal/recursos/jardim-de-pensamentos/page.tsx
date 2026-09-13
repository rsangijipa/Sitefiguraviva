import type { Metadata } from "next";
import PortalResourcePage from "@/components/portal/PortalResourcePage";
import ThoughtGardenExperience from "@/features/thought-garden/components/ThoughtGardenExperience";

export const metadata: Metadata = {
  title: "Jardim de Pensamentos",
  description: "Observe pensamentos sem precisar afastá-los.",
};

export default function JardimDePensamentosPage() {
  return (
    <PortalResourcePage
      backHref="/portal/materials"
      backLabel="Voltar aos recursos"
    >
      <ThoughtGardenExperience />
    </PortalResourcePage>
  );
}
