import type { Metadata } from "next";
import CoursesPage from "../curso/page";

export const metadata: Metadata = {
  title: "Formações",
  description:
    "Conheça os ciclos de aprendizagem, cursos e grupos de estudos do Instituto Figura Viva.",
  alternates: { canonical: "/formacoes" },
  openGraph: {
    title: "Formações | Figura Viva",
    description: "Percursos de estudo em Gestalt-terapia.",
  },
};

export default CoursesPage;
