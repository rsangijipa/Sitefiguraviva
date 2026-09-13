import type { Metadata } from "next";
import PortalResourcePage from "@/components/portal/PortalResourcePage";
import { ThoughtRiverExperience } from "@/features/interactive-resources/thought-river/ThoughtRiverExperience";

export const metadata: Metadata = {
  title: "Histórico - Rio dos Pensamentos",
  description: "Suas experiências guardadas no Rio dos Pensamentos.",
};

export default function HistoricoRioDosPensamentosPage() {
  return (
    <PortalResourcePage
      backHref="/portal/recursos/rio-dos-pensamentos"
      backLabel="Voltar ao rio"
    >
      <ThoughtRiverExperience initialView="history" />
    </PortalResourcePage>
  );
}
