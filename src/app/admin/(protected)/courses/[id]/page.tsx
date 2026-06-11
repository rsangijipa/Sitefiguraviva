import CourseEditorClient from "./CourseEditorClient";
import { deepSafeSerialize } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { getCourse } from "@/lib/repositories/courseRepository.server";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course;

  try {
    course = await getCourse(id);

    if (!course) {
      logger.warn("[AdminCourseEditorPage] Course not found", { id });
      return (
        <div className="p-12 text-center text-stone-500">
          Curso nÃ£o encontrado.
        </div>
      );
    }
  } catch (e: any) {
    logger.error("[AdminCourseEditorPage] Failed to load course", {
      id,
      message: e.message,
      code: e.code,
      stack: e.stack,
    });
    return (
      <div className="p-12 text-center text-red-500">
        <h3 className="font-bold">Erro ao carregar curso</h3>
        <p className="text-sm mt-2">{e.message}</p>
        <p className="text-xs text-stone-400 mt-4">ID do curso: {id}</p>
        <p className="text-xs text-stone-400">
          Verifique os logs do servidor para detalhes.
        </p>
      </div>
    );
  }

  const serializedCourse = deepSafeSerialize(course);

  return <CourseEditorClient initialCourse={serializedCourse} />;
}
