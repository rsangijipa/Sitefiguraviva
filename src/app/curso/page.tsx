import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import { listPublishedCourses } from "@/features/content/infrastructure/supabaseContentRepository";
import {
  getCourseLastDate,
  splitCoursesByTimeline,
} from "@/features/courses/domain/course-timeline";
import CoursesListClient from "./CoursesListClient";

// Revalidate every hour
export const revalidate = 3600;

// Reads the same Supabase `courses` table (published + open/closed) as the
// homepage's "Formações" section and the /curso/[id] detail page. This page
// used to read from Firestore while the home page and course detail already
// read from Supabase — two different data sources meant the count and
// content shown here vs. on the homepage never matched.
async function getCourses(): Promise<any[]> {
  try {
    return await listPublishedCourses();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();
  // Courses whose dates already passed move to the history section; the
  // split runs on the server so every visitor sees the same Brazilian date.
  const split = splitCoursesByTimeline(courses);
  const past = split.past;
  // The first course is the featured card: prefer one open for enrollment
  // (stable sort keeps the newest-first order inside each group).
  const current = [...split.current].sort(
    (a, b) => Number(!!b.enrollmentOpen) - Number(!!a.enrollmentOpen),
  );
  const pastCourses = past.map((course) => ({
    ...course,
    enrollmentOpen: false,
    lastDate: getCourseLastDate(course),
  }));

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Formação & estudos"
        title="Ciclos de aprendizagem"
        description="Cursos, grupos de estudos e vivências para habitar a Gestalt-terapia com rigor, sensibilidade e presença."
        backgroundImage="/assets/fv/heroes/formacoes.webp"
      />
      <CoursesListClient courses={current} pastCourses={pastCourses} />
    </PublicSiteFrame>
  );
}
