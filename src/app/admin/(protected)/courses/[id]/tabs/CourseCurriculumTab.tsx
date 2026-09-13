"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminCourseService } from "@/services/adminCourseService";
import { ModuleDoc, LessonDoc } from "@/types/lms";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  FileText,
  Video,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  toggleModulePublish,
  toggleLessonPublish,
} from "@/app/actions/admin-publishing";

// We will need a LessonEditor Modal/Drawer later. For now, skeleton.

export default function CourseCurriculumTab({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, LessonDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({});
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonFormModuleId, setLessonFormModuleId] = useState<string | null>(
    null,
  );
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isReordering, setIsReordering] = useState(false);

  // Fetch Structure
  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const mods = await adminCourseService.getModules(courseId);
      const sortedMods = mods.sort((a, b) => (a.order || 0) - (b.order || 0));
      setModules(sortedMods);
      // Auto expand all
      const expanded: Record<string, boolean> = {};
      sortedMods.forEach((m) => (expanded[m.id] = true));
      setExpandedModules(expanded);

      // Fetch lessons for each module
      const lMap: Record<string, LessonDoc[]> = {};
      await Promise.all(
        sortedMods.map(async (m) => {
          const lessons = await adminCourseService.getLessons(courseId, m.id);
          lMap[m.id] = lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        }),
      );
      setLessonsMap(lMap);
    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar currículo", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleCreateModule = async () => {
    const title = newModuleTitle.trim();
    if (!title) {
      addToast("Informe o nome do módulo", "error");
      return;
    }
    try {
      await adminCourseService.createModule(courseId, title, modules.length);
      addToast("Módulo criado", "success");
      setNewModuleTitle("");
      setIsCreatingModule(false);
      loadModules();
    } catch (e) {
      addToast("Erro ao criar módulo", "error");
    }
  };

  const handleCreateLesson = async (moduleId: string) => {
    const title = newLessonTitle.trim();
    if (!title) return;
    try {
      const currentCount = lessonsMap[moduleId]?.length || 0;
      await adminCourseService.createLesson(
        courseId,
        moduleId,
        title,
        currentCount,
      );
      addToast("Aula criada", "success");
      setNewLessonTitle("");
      setLessonFormModuleId(null);
      loadModules(); // Or just reload that module's lessons
    } catch (e) {
      addToast("Erro ao criar aula", "error");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Excluir módulo? Aulas serão perdidas.")) return;
    try {
      await adminCourseService.deleteModule(courseId, moduleId);
      loadModules();
    } catch (e) {
      addToast("Erro ao excluir", "error");
    }
  };

  const moveModule = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= modules.length || isReordering) return;
    const reordered = [...modules];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    const normalized = reordered.map((module, order) => ({ ...module, order }));
    setModules(normalized);
    setIsReordering(true);
    try {
      await Promise.all([
        adminCourseService.updateModule(courseId, normalized[index].id, {
          order: index,
        }),
        adminCourseService.updateModule(courseId, normalized[nextIndex].id, {
          order: nextIndex,
        }),
      ]);
    } catch {
      addToast("Não foi possível reordenar os módulos", "error");
      loadModules();
    } finally {
      setIsReordering(false);
    }
  };

  const moveLesson = async (
    moduleId: string,
    index: number,
    direction: -1 | 1,
  ) => {
    const lessons = lessonsMap[moduleId] || [];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= lessons.length || isReordering) return;
    const reordered = [...lessons];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    const normalized = reordered.map((lesson, order) => ({ ...lesson, order }));
    setLessonsMap((previous) => ({ ...previous, [moduleId]: normalized }));
    setIsReordering(true);
    try {
      await Promise.all([
        adminCourseService.updateLesson(
          courseId,
          moduleId,
          normalized[index].id,
          { order: index },
        ),
        adminCourseService.updateLesson(
          courseId,
          moduleId,
          normalized[nextIndex].id,
          { order: nextIndex },
        ),
      ]);
    } catch {
      addToast("Não foi possível reordenar as aulas", "error");
      loadModules();
    } finally {
      setIsReordering(false);
    }
  };

  // Navigate to the Block Editor
  const handleEditLesson = (moduleId: string, lessonId: string) => {
    router.push(`/admin/courses/${courseId}/lessons/${lessonId}`);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-stone-400">
        Carregando estrutura...
      </div>
    );

  const lessons = Object.values(lessonsMap).flat();
  const publishedModules = modules.filter(
    (module) => module.isPublished,
  ).length;
  const publishedLessons = lessons.filter(
    (lesson) => lesson.isPublished,
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary">
              Currículo do curso
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Organize módulos, aulas e o que ficará visível para a turma.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setLoading(true);
                try {
                  await adminCourseService.syncLessonsCount(courseId);
                  addToast("Estatísticas sincronizadas", "success");
                  loadModules();
                } catch (e) {
                  addToast("Erro ao sincronizar", "error");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Sincronizar Contagem
            </Button>
            <Button
              onClick={() => setIsCreatingModule((value) => !value)}
              leftIcon={<Plus size={16} />}
            >
              Adicionar Módulo
            </Button>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-stone-100 pt-5">
          <div className="rounded-xl bg-stone-50 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Módulos
            </dt>
            <dd className="mt-1 font-semibold text-stone-800">
              {modules.length}{" "}
              <span className="text-xs font-normal text-stone-400">
                / {publishedModules} publicados
              </span>
            </dd>
          </div>
          <div className="rounded-xl bg-stone-50 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Aulas
            </dt>
            <dd className="mt-1 font-semibold text-stone-800">
              {lessons.length}{" "}
              <span className="text-xs font-normal text-stone-400">
                / {publishedLessons} publicadas
              </span>
            </dd>
          </div>
          <div className="rounded-xl bg-stone-50 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Próximo passo
            </dt>
            <dd className="mt-1 text-sm font-semibold text-stone-700">
              {modules.length ? "Revise publicações" : "Crie um módulo"}
            </dd>
          </div>
        </dl>
        {isCreatingModule && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateModule();
            }}
            className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row"
          >
            <label className="sr-only" htmlFor="new-module-title">
              Nome do módulo
            </label>
            <input
              id="new-module-title"
              autoFocus
              value={newModuleTitle}
              onChange={(event) => setNewModuleTitle(event.target.value)}
              placeholder="Ex.: Fundamentos e referências"
              className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Criar módulo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreatingModule(false);
                  setNewModuleTitle("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>

      <div className="space-y-4">
        {modules.map((module, idx) => (
          <div
            key={module.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            {/* Module Header */}
            <div className="group flex flex-wrap items-center gap-3 border-b border-stone-100 bg-stone-50 p-4">
              <button
                onClick={() => toggleModule(module.id)}
                className="p-1 hover:bg-stone-200 rounded text-stone-400"
              >
                {expandedModules[module.id] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <span className="font-mono text-xs text-stone-400 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                MÚDULO {idx + 1}
              </span>
              <span
                className={cn(
                  "font-bold flex-1 transition-colors",
                  module.isPublished
                    ? "text-stone-700"
                    : "text-stone-400 italic",
                )}
              >
                {module.title}
              </span>

              {/* Publish Toggle */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const newStatus = !module.isPublished;
                  const result = await toggleModulePublish(
                    courseId,
                    module.id,
                    newStatus,
                  );
                  if (result.success) {
                    setModules(
                      modules.map((m) =>
                        m.id === module.id
                          ? { ...m, isPublished: newStatus }
                          : m,
                      ),
                    );
                    addToast(
                      newStatus ? "Módulo publicado" : "Módulo oculto",
                      "success",
                    );
                  } else {
                    addToast("Erro: " + result.error, "error");
                  }
                }}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors mr-2",
                  module.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-stone-100 text-stone-400 hover:bg-stone-200",
                )}
              >
                {module.isPublished ? "Publicado" : "Rascunho"}
              </button>

              <div className="ml-auto flex gap-1">
                <div className="flex rounded-lg border border-stone-200 bg-white">
                  <button
                    type="button"
                    disabled={idx === 0 || isReordering}
                    onClick={() => moveModule(idx, -1)}
                    aria-label={`Mover ${module.title} para cima`}
                    className="rounded-l-lg p-2 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === modules.length - 1 || isReordering}
                    onClick={() => moveModule(idx, 1)}
                    aria-label={`Mover ${module.title} para baixo`}
                    className="rounded-r-lg border-l border-stone-200 p-2 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  aria-label={`Excluir ${module.title}`}
                  className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <AnimatePresence>
              {expandedModules[module.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white"
                >
                  <div className="divide-y divide-stone-50">
                    {(lessonsMap[module.id] || []).map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="group flex flex-wrap items-center gap-3 px-4 py-3 sm:pl-12 hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-stone-300 font-mono text-xs">
                          {lIdx + 1}.
                        </span>
                        <div className="w-8 h-8 rounded bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                          {lesson.type === "video" ? (
                            <Video size={14} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium flex-1",
                            lesson.isPublished
                              ? "text-stone-700"
                              : "text-stone-400 italic",
                          )}
                        >
                          {lesson.title}
                        </span>

                        <div className="flex gap-2 items-center">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const newStatus = !lesson.isPublished;
                              const result = await toggleLessonPublish(
                                courseId,
                                module.id,
                                lesson.id,
                                newStatus,
                              );
                              if (result.success) {
                                setLessonsMap((prev) => ({
                                  ...prev,
                                  [module.id]: prev[module.id].map((l) =>
                                    l.id === lesson.id
                                      ? { ...l, isPublished: newStatus }
                                      : l,
                                  ),
                                }));
                                addToast(
                                  newStatus ? "Aula publicada" : "Aula oculta",
                                  "success",
                                );
                              } else {
                                addToast("Erro: " + result.error, "error");
                              }
                            }}
                            className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors shrink-0",
                              lesson.isPublished
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-stone-100 text-stone-400 hover:bg-stone-200",
                            )}
                          >
                            {lesson.isPublished ? "Publicada" : "Rascunho"}
                          </button>
                        </div>

                        <div className="ml-auto flex gap-2">
                          <div className="flex rounded-lg border border-stone-200 bg-white">
                            <button
                              type="button"
                              disabled={lIdx === 0 || isReordering}
                              onClick={() => moveLesson(module.id, lIdx, -1)}
                              aria-label={`Mover ${lesson.title} para cima`}
                              className="rounded-l-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={
                                lIdx ===
                                  (lessonsMap[module.id] || []).length - 1 ||
                                isReordering
                              }
                              onClick={() => moveLesson(module.id, lIdx, 1)}
                              aria-label={`Mover ${lesson.title} para baixo`}
                              className="rounded-r-lg border-l border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEditLesson(module.id, lesson.id)
                            }
                            leftIcon={<Edit size={12} />}
                          >
                            Conteúdo
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 p-3 sm:pl-12">
                    {lessonFormModuleId === module.id ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleCreateLesson(module.id);
                        }}
                        className="flex flex-col gap-2 sm:flex-row"
                      >
                        <label
                          className="sr-only"
                          htmlFor={`new-lesson-${module.id}`}
                        >
                          Título da aula
                        </label>
                        <input
                          id={`new-lesson-${module.id}`}
                          autoFocus
                          value={newLessonTitle}
                          onChange={(event) =>
                            setNewLessonTitle(event.target.value)
                          }
                          placeholder="Título da nova aula"
                          className="min-w-0 flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            Criar aula
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setLessonFormModuleId(null);
                              setNewLessonTitle("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setLessonFormModuleId(module.id);
                          setNewLessonTitle("");
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-200 py-2.5 text-xs font-bold uppercase tracking-wide text-stone-500 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                      >
                        <Plus size={14} /> Adicionar Aula
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
            Nenhum módulo criado.
          </div>
        )}
      </div>
    </div>
  );
}
