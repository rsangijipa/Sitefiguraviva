import type { Metadata } from "next";
import PortalResourcePage from "@/components/portal/PortalResourcePage";
import { ThoughtRiverExperience } from "@/features/interactive-resources/thought-river/ThoughtRiverExperience";

export const metadata: Metadata = {
  title: "Rio dos Pensamentos",
  description: "Observe pensamentos passando, sem precisar afastá-los.",
};

export default function RioDosPensamentosPage() {
  return (
    <PortalResourcePage
      backHref="/portal/materials"
      backLabel="Voltar aos recursos"
    >
      <ThoughtRiverExperience />
    </PortalResourcePage>
  );
}
