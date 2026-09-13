import PortalResourcePage from "@/components/portal/PortalResourcePage";
import { AwarenessSoundsExperience } from "@/features/interactive-resources/awareness-sounds/AwarenessSoundsExperience";

export default function SonsParaAwarenessPage() {
  return (
    <PortalResourcePage
      backHref="/portal/materials"
      backLabel="Voltar aos recursos"
    >
      <AwarenessSoundsExperience />
    </PortalResourcePage>
  );
}
