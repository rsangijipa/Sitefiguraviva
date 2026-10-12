import { notFound } from "next/navigation";
import { assertCanAuthorCourse } from "@/lib/auth/authoring-gate";
import {
  getAdminCourse,
  listAdminModules,
  listAdminLessons,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import LessonEditorClient from "./LessonEditorClient";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  await assertCanAuthorCourse(id);
  const [course, modules] = await Promise.all([
    getAdminCourse(id),
    listAdminModules(id),
  ]);
  if (!course) notFound();
  const groups = await Promise.all(
    modules.map(async (module) => ({
      module,
      lessons: await listAdminLessons(id, module.id),
    })),
  );
  for (const { module, lessons } of groups) {
    const lesson = lessons.find((lesson) => lesson.id === lessonId);
    if (lesson)
      return (
        <LessonEditorClient
          course={course}
          module={module}
          initialLesson={lesson}
        />
      );
  }
  notFound();
}
