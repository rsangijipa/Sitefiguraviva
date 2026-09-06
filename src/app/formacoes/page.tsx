import type { Metadata } from "next";

import CoursesPage from "@/app/curso/page";
import { PublicSiteFrame } from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Formações",
  description:
    "Formações, grupos de estudos e vivências em Gestalt-terapia do Instituto Figura Viva.",
  alternates: { canonical: "/formacoes" },
};

export default function FormationsPage() {
  return (
    <PublicSiteFrame>
      <CoursesPage />
    </PublicSiteFrame>
  );
}
