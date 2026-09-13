import type { Metadata } from "next";
import PortalResourcePage from "@/components/portal/PortalResourcePage";
import ThoughtGardenExperience from "@/features/thought-garden/components/ThoughtGardenExperience";

export const metadata: Metadata = {
  title: "Histórico - Jardim de Pensamentos",
  description: "Seus pensamentos guardados.",
};

export default function HistoricoPage() {
  return (
    <PortalResourcePage
      backHref="/portal/recursos/jardim-de-pensamentos"
      backLabel="Voltar ao jardim"
    >
      <ThoughtGardenExperience />
    </PortalResourcePage>
  );
}
