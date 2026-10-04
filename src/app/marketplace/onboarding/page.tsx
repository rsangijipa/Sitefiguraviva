import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/config/features";
import ProfessionalOnboarding from "@/components/marketplace/ProfessionalOnboarding";

export default function OnboardingPage() {
  // Marketplace tenancy is still in development. Until the flag is turned on,
  // this route must not be reachable by typing the URL directly.
  if (!isFeatureEnabled("marketplaceTenancy")) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ProfessionalOnboarding />
    </div>
  );
}
