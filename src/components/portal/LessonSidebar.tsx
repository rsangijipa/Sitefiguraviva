import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Search,
  Lock,
  PlayCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Lesson, Module } from "@/types/lms";

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  className?: string;
}

export const LessonSidebar = ({
  modules,
  currentLessonId,
  onSelectLesson,
  className,
}: LessonSidebarProps) => {
  const [query, setQuery] = useState("");
  const matchesSearch = (lesson: Lesson) => lesson.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR"));
  // Determine which module is initially open based on current lesson
  const initialOpenModule =
    modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))?.id ||
    modules[0]?.id;
  const [openModules, setOpenModules] = useState<string[]>(
    initialOpenModule ? [initialOpenModule] : [],
  );

  useEffect(() => {
    const activeModule = modules.find(module => module.lessons.some(lesson => lesson.id === currentLessonId));
    if (activeModule) setOpenModules(values => values.includes(activeModule.id) ? values : [...values, activeModule.id]);
  }, [modules, currentLessonId]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-l border-stone-100",
        className,
      )}
    >
      <div className="p-6 border-b border-stone-100">
        <h3 className="font-serif text-xl text-primary">Conteúdo do Curso</h3>
        <p
          data-testid="lesson-sidebar-progress"
          className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold"
        >
          {modules.reduce(
            (acc, m) => acc + m.lessons.filter((l) => l.isCompleted).length,
            0,
          )}{" "}
          / {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Aulas
          concluídas
        </p>
      </div>

      <label className="portal-field px-4 py-3 border-b border-stone-100">
        <span>Buscar aula</span>
        <div className="relative"><Search size={18} aria-hidden="true" className="absolute left-3 top-4 text-stone-500" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome da aula" /></div>
      </label>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3" data-lenis-prevent>
        {query.trim() && !modules.some(module => module.lessons.some(matchesSearch)) && <p role="status" className="p-3 text-sm text-stone-600">Nenhuma aula encontrada. <button type="button" className="min-h-12 underline" onClick={() => setQuery("")}>Limpar busca</button></p>}
        {modules.map((module) => {
          const visibleLessons = module.lessons.filter(matchesSearch);
          if (!visibleLessons.length) return null;
          const isOpen = query.trim().length > 0 || openModules.includes(module.id);
          const completedCount = module.lessons.filter(
            (l) => l.isCompleted,
          ).length;
          const totalCount = module.lessons.length;
          const isCompleted = completedCount === totalCount && totalCount > 0;

          return (
            <div
              key={module.id}
              className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50/50"
            >
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                aria-expanded={isOpen}
                aria-controls={`module-lessons-${module.id}`}
                className="w-full min-h-14 flex items-center justify-between gap-3 p-4 bg-white hover:bg-stone-50 transition-colors text-left"
              >
                <div>
                  <h4 className="font-bold text-sm text-primary">
                    {module.title}
                  </h4>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">
                    {completedCount}/{totalCount} Aulas
                  </p>
                </div>
                <div className="text-stone-500">
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div id={`module-lessons-${module.id}`} className="p-2 space-y-1">
                      {visibleLessons.map((lesson) => {
                        const isActive = lesson.id === currentLessonId;
                        const durationLabel =
                          typeof lesson.duration === "number" &&
                          lesson.duration > 0
                            ? `${lesson.duration} min`
                            : null;
                        const statusLabel = lesson.isLocked
                          ? `bloqueada. ${lesson.lockReason ?? ""}`.trim()
                          : lesson.isCompleted
                            ? "concluída"
                            : "não concluída";
                        return (
                          <button
                            type="button"
                            key={lesson.id}
                            onClick={() =>
                              !lesson.isLocked && onSelectLesson(lesson.id)
                            }
                            disabled={lesson.isLocked}
                            aria-current={isActive ? "page" : undefined}
                            aria-label={`${lesson.title}, ${statusLabel}${durationLabel ? `, ${durationLabel}` : ""}`}
                            className={cn(
                              "w-full min-h-14 flex items-center gap-3 p-3 rounded-xl text-left transition-colors text-base group touch-manipulation",
                              isActive
                                ? "bg-primary text-white shadow-md"
                                : "hover:bg-white hover:shadow-sm text-stone-600",
                              lesson.isLocked &&
                                "opacity-50 cursor-not-allowed hover:bg-transparent",
                            )}
                          >
                            <div
                              className={cn(
                                "shrink-0",
                                isActive
                                  ? "text-gold"
                                  : "text-stone-300 group-hover:text-primary/40",
                              )}
                            >
                              {lesson.isLocked ? (
                                <Lock size={16} />
                              ) : lesson.isCompleted ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-green-500"
                                />
                              ) : (
                                <PlayCircle size={16} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium line-clamp-2",
                                  isActive ? "text-white" : "",
                                )}
                              >
                                {lesson.title}
                              </p>
                              {lesson.isLocked && lesson.lockReason ? (
                                <p className="text-xs mt-0.5 text-stone-500">
                                  {lesson.lockReason}
                                </p>
                              ) : (
                                durationLabel && (
                                  <p
                                    className={cn(
                                      "text-xs mt-0.5 opacity-60",
                                      isActive ? "text-white" : "",
                                    )}
                                  >
                                    {durationLabel}
                                  </p>
                                )
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
