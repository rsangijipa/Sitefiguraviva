import LessonEditorClient from "./LessonEditorClient";
import {
  getAdminCourse,
  listAdminLessons,
  listAdminModules,
} from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = await params;
  const [course, modules] = await Promise.all([
    getAdminCourse(courseId),
    listAdminModules(courseId),
  ]);
  if (!course) return <div>Curso não encontrado</div>;

  const lessonsByModule = await Promise.all(
    modules.map(async (module) => ({
      module,
      lessons: await listAdminLessons(courseId, module.id),
    })),
  );
  const parent = lessonsByModule.find(({ lessons }) =>
    lessons.some((lesson) => lesson.id === lessonId),
  );
  const lesson = parent?.lessons.find((item) => item.id === lessonId);
  if (!parent || !lesson) return <div>Aula não encontrada no currículo</div>;

  return (
    <LessonEditorClient
      course={course}
      module={parent.module}
      initialLesson={lesson}
    />
  );
}
