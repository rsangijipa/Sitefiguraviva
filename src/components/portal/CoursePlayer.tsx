import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Lock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "../lms/VideoPlayer";
import { BlockRenderer } from "../lms/BlockRenderer";
import { LessonSidebar } from "./LessonSidebar";
import { Lesson, Module } from "@/types/lms";
import Button from "../ui/Button";
import { cn } from "@/lib/utils";
import { SafeHtml } from "../SafeHtml";
import { trackEvent } from "@/actions/analytics";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { VideoOff } from "lucide-react";
import { getYouTubeVideoId } from "@/lib/course-content/media";

interface CoursePlayerProps {
  course: {
    id: string;
    title: string;
    backLink: string;
  };
  modules: Module[];
  activeLesson: Lesson | null;
  onSelectLesson: (lessonId: string) => void;
  onMarkComplete: (lessonId: string, moduleId: string) => void;
  nextLessonId?: string;
  prevLessonId?: string;
  /** Set when the next lesson exists but is still locked for this student. */
  nextLessonLockReason?: string;
  loading?: boolean;
  initialMaxWatchedSecond?: number;
  onVideoCompleted?: () => void;
}

const SIDEBAR_ID = "lesson-sidebar";

const isDesktopViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1280px)").matches;

const formatDuration = (minutes?: number) =>
  typeof minutes === "number" && minutes > 0 ? `${minutes} min` : null;

// Wrapper component to isolate hook usage per lesson
const CourseVideoWrapper = ({
  courseId,
  moduleId,
  lesson,
  onMarkComplete,
  initialMaxWatchedSecond,
  onVideoCompleted,
}: {
  courseId: string;
  moduleId: string;
  lesson: Lesson;
  onMarkComplete: (id: string, modId: string) => void;
  initialMaxWatchedSecond?: number;
  onVideoCompleted?: () => void;
}) => {
  const videoId = getYouTubeVideoId(lesson.videoUrl);

  if (!videoId)
    return (
      <div className="aspect-video bg-stone-900 flex items-center justify-center text-white p-6">
        <EmptyState
          icon={VideoOff}
          title="Vídeo indisponível"
          description="O vídeo desta aula ainda não foi configurado. Avise a equipe pelo suporte do portal."
          className="bg-transparent border-none shadow-none text-white"
        />
      </div>
    );

  return (
    <VideoPlayer
      videoId={videoId}
      courseId={courseId}
      moduleId={moduleId}
      lessonId={lesson.id}
      initialCompleted={lesson.isCompleted}
      initialMaxWatchedSecond={initialMaxWatchedSecond}
      onCompleted={() => {
        onMarkComplete(lesson.id, moduleId);
        if (onVideoCompleted) onVideoCompleted();
      }}
    />
  );
};

export const CoursePlayer = ({
  course,
  modules,
  activeLesson,
  onSelectLesson,
  onMarkComplete,
  nextLessonId,
  prevLessonId,
  nextLessonLockReason,
  loading = false,
  initialMaxWatchedSecond,
  onVideoCompleted,
}: CoursePlayerProps) => {
  // null = follow the viewport (closed on phones, open on desktop) so the
  // lesson list never covers the content on first load in a phone.
  const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null);
  // Starts false on server and first client render to keep hydration stable;
  // the CSS default for the "auto" state already shows the list on desktop.
  const [isDesktop, setIsDesktop] = useState(false);
  const isSidebarOpen = sidebarOpen ?? isDesktop;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (activeLesson?.id) {
      trackEvent("page_view", activeLesson.id, { courseId: course.id });
    }
  }, [activeLesson?.id, course.id]);

  useEffect(() => {
    if (!isSidebarOpen || isDesktop) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isSidebarOpen, isDesktop]);

  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !(prev ?? isDesktopViewport())),
    [],
  );

  const selectLesson = useCallback(
    (lessonId: string) => {
      if (!isDesktopViewport()) setSidebarOpen(false);
      onSelectLesson(lessonId);
    },
    [onSelectLesson],
  );

  const allLessons = useMemo(
    () => modules.flatMap((module) => module.lessons),
    [modules],
  );
  const lessonPosition = activeLesson
    ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id) + 1
    : 0;
  const completedCount = allLessons.filter((lesson) => lesson.isCompleted)
    .length;

  const blocks = useMemo(
    () =>
      [...(activeLesson?.blocks ?? [])]
        .filter((block) => block && block.isPublished !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [activeLesson?.blocks],
  );

  if (loading) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex flex-col bg-[#FDFCF9] animate-pulse">
        <header className="h-16 bg-white border-b border-stone-100 flex items-center px-4">
          <Skeleton className="w-10 h-10 rounded-full mr-4" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-4" />
            <Skeleton className="w-32 h-3" />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 md:p-12 space-y-8">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-full h-24" />
            </div>
          </main>
          <aside className="hidden md:block w-96 border-l border-stone-100 p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-12 rounded-lg" />
            ))}
          </aside>
        </div>
      </div>
    );
  }

  const getModuleId = (lesson: Lesson) => {
    if (lesson.moduleId) return lesson.moduleId;
    const parent = modules.find((m) =>
      m.lessons.some((l) => l.id === lesson.id),
    );
    return parent?.id || "";
  };

  const activeModule = activeLesson
    ? modules.find((module) => module.id === getModuleId(activeLesson))
    : undefined;
  // Text, library and live lessons only get a video frame when one was set;
  // a video lesson without a link still shows the "unavailable" notice.
  const hasVideo =
    !!activeLesson &&
    (activeLesson.type === "video" || !!activeLesson.videoUrl?.trim());
  const description = activeLesson?.description?.trim();
  const isQuizWithoutAssessment = activeLesson?.type === "quiz";
  const hasContent = hasVideo || !!description || blocks.length > 0;
  const duration = formatDuration(activeLesson?.duration);

  return (
    <div className="portal-lesson-player flex flex-col bg-[#FDFCF9] overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between gap-2 px-4 shrink-0 z-20 relative">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={course.backLink}
            aria-label="Voltar para a página do curso"
            className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <p className="font-bold text-primary text-sm md:text-base line-clamp-1">
              {course.title}
            </p>
            {lessonPosition > 0 && (
              <p className="text-xs text-stone-500 line-clamp-1">
                Aula {lessonPosition} de {allLessons.length}
                <span className="hidden sm:inline">
                  {" "}
                  · {completedCount} concluída{completedCount === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls={SIDEBAR_ID}
          aria-label={
            isSidebarOpen ? "Fechar lista de aulas" : "Abrir lista de aulas"
          }
          className="shrink-0 min-h-12 min-w-12 flex items-center justify-center gap-2 p-2 sm:px-4 text-sm font-semibold text-primary bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="xl:hidden" aria-hidden="true">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            {isSidebarOpen ? "Expandir tela" : "Ver aulas"}
          </span>
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {isSidebarOpen && !isDesktop && <button type="button" aria-label="Ocultar lista de aulas" onClick={() => setSidebarOpen(false)} className="absolute inset-0 z-10 bg-stone-900/30" /> }
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-black/5 relative" inert={isSidebarOpen && !isDesktop} data-lenis-prevent>
          <div className="max-w-5xl mx-auto w-full min-h-full flex flex-col">
            {activeLesson && hasVideo && (
              <div
                className={cn(
                  "w-full bg-black transition-all duration-300 ease-in-out",
                  isSidebarOpen ? "aspect-video" : "aspect-video md:h-[60vh]",
                )}
              >
                <CourseVideoWrapper
                  courseId={course.id}
                  moduleId={getModuleId(activeLesson)}
                  lesson={activeLesson}
                  onMarkComplete={onMarkComplete}
                  initialMaxWatchedSecond={initialMaxWatchedSecond}
                  onVideoCompleted={onVideoCompleted}
                />
              </div>
            )}

            <div className="flex-1 bg-[#FDFCF9] p-4 sm:p-6 xl:p-8">
              {activeLesson ? (
                <article
                  aria-labelledby="lesson-title"
                  className="space-y-8 max-w-4xl mx-auto"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 pb-8">
                    <div>
                      {activeModule?.title && (
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                          {activeModule.title}
                        </p>
                      )}
                      <h1
                        id="lesson-title"
                        className="font-serif text-2xl sm:text-3xl text-primary mb-2"
                      >
                        {activeLesson.title}
                      </h1>
                      {duration && (
                        <p className="flex items-center gap-1.5 text-stone-500 text-sm">
                          <Clock size={14} aria-hidden="true" />
                          {duration}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      {activeLesson.isCompleted ? (
                        <p
                          role="status"
                          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-green-500 px-4 h-10 text-sm font-bold text-green-700"
                        >
                          <CheckCircle size={16} aria-hidden="true" />
                          Aula concluída
                        </p>
                      ) : activeLesson.type === "video" ? (
                        <p className="text-xs text-stone-500 max-w-[16rem] md:text-right">
                          A aula é marcada como concluída quando você assiste a
                          90% do vídeo.
                        </p>
                      ) : isQuizWithoutAssessment ? null : (
                        <Button
                          data-testid="mark-lesson-complete"
                          onClick={() =>
                            onMarkComplete(
                              activeLesson.id,
                              getModuleId(activeLesson),
                            )
                          }
                          variant="primary"
                        >
                          Marcar como concluída
                        </Button>
                      )}
                    </div>
                  </div>

                  {isQuizWithoutAssessment && (
                    <div
                      role="note"
                      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                    >
                      <ClipboardList
                        size={20}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <p>
                        A avaliação desta aula ainda não está disponível. Você
                        pode seguir para as próximas aulas e voltar aqui depois.
                      </p>
                    </div>
                  )}

                  {description && (
                    <div className="prose prose-stone max-w-none">
                      <SafeHtml html={description} />
                    </div>
                  )}

                  {blocks.length > 0 && (
                    <div className="space-y-8">
                      {blocks.map((block) => (
                        <BlockRenderer
                          key={block.id}
                          block={block}
                          courseId={course.id}
                          moduleId={getModuleId(activeLesson)}
                          lessonId={activeLesson.id}
                          isLessonCompleted={activeLesson.isCompleted}
                        />
                      ))}
                    </div>
                  )}

                  {!hasContent && !isQuizWithoutAssessment && (
                    <p className="rounded-xl bg-stone-50 p-8 text-center text-stone-500">
                      O conteúdo desta aula ainda não foi publicado.
                    </p>
                  )}

                  {/* Navigation Footer */}
                  <nav
                    aria-label="Navegação entre aulas"
                    className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 pt-6 border-t border-stone-100"
                  >
                    <Button
                      variant="ghost"
                      disabled={!prevLessonId}
                      onClick={() => prevLessonId && selectLesson(prevLessonId)}
                      leftIcon={<ChevronLeft size={16} aria-hidden="true" />}
                    >
                      Aula anterior
                    </Button>

                    <div className="flex flex-col min-w-0 items-stretch gap-2">
                      <Button
                        variant={
                          activeLesson.isCompleted &&
                          nextLessonId &&
                          !nextLessonLockReason
                            ? "primary"
                            : "ghost"
                        }
                        disabled={!nextLessonId || !!nextLessonLockReason}
                        aria-describedby={
                          nextLessonLockReason ? "next-lesson-lock" : undefined
                        }
                        onClick={() =>
                          nextLessonId && selectLesson(nextLessonId)
                        }
                        rightIcon={
                          nextLessonLockReason ? (
                            <Lock size={16} aria-hidden="true" />
                          ) : (
                            <ChevronRight size={16} aria-hidden="true" />
                          )
                        }
                      >
                        Próxima aula
                      </Button>
                      {nextLessonLockReason && (
                        <p
                          id="next-lesson-lock"
                          className="text-xs text-stone-500 text-right"
                        >
                          {nextLessonLockReason}
                        </p>
                      )}
                    </div>
                  </nav>
                </article>
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <EmptyState
                    icon={Menu}
                    title="Selecione uma aula"
                    description="Escolha um dos tópicos na lista de aulas para iniciar seus estudos."
                    className="bg-transparent border-none shadow-none"
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        <aside
          id={SIDEBAR_ID}
          aria-label="Aulas do curso"
          className={cn(
            "absolute xl:relative right-0 top-0 bottom-0 z-10 w-full sm:w-80 xl:w-80 max-w-full shrink-0 bg-white shadow-2xl xl:shadow-none transition-all duration-300 ease-in-out transform",
            sidebarOpen === null
              ? "translate-x-full invisible xl:visible xl:translate-x-0"
              : sidebarOpen
                ? "translate-x-0"
                : "translate-x-full invisible xl:w-0 overflow-hidden",
          )}
        >
          <LessonSidebar
            modules={modules}
            currentLessonId={activeLesson?.id || ""}
            onSelectLesson={selectLesson}
          />
        </aside>
      </div>
    </div>
  );
};
