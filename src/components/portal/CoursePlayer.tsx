import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { VideoPlayer } from "../lms/VideoPlayer";
import { LessonSidebar } from "./LessonSidebar";
import { Lesson, Module } from "@/types/lms";
import Button from "../ui/Button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { trackEvent } from "@/actions/analytics";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { AlertCircle, VideoOff } from "lucide-react";

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
  loading?: boolean;
  // New props for Video-First features
  initialMaxWatchedSecond?: number;
  onVideoCompleted?: () => void;
}

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
  // FIX: useProgress now requires moduleId (PRG-02)
  // We are deprecating useProgress hook in favor of direct VideoPlayer logic for SSoT
  // But keeping it for now if it does other things, but VideoPlayer is self-contained.

  // We are replacing the old VideoPlayer usage with the Refactored VideoPlayer
  // The Refactored VideoPlayer takes: videoId, courseId, moduleId, lessonId, initialCompleted, initialMaxWatchedSecond, onCompleted

  // Check if lesson.type is strictly video to avoid errors
  const videoUrl = (lesson as any).videoUrl || "";
  // Extract video ID from URL (basic regex for youtube)
  const videoId =
    videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^#&?]*)/,
    )?.[1] || "";

  if (!videoId)
    return (
      <div className="aspect-video bg-stone-900 flex items-center justify-center text-white p-6">
        <EmptyState
          icon={<VideoOff size={32} className="text-white/20" />}
          title="Vídeo Indisponível"
          description="O link do vídeo para esta aula não foi configurado ou é inválido."
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
  loading = false,
  initialMaxWatchedSecond,
  onVideoCompleted,
}: CoursePlayerProps) => {
  // ...
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FDFCF9] animate-pulse">
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

  useEffect(() => {
    if (activeLesson?.id) {
      trackEvent("page_view", activeLesson.id, { courseId: course.id });
    }
  }, [activeLesson?.id, course.id]);

  // Helper to resolve Module ID
  const getModuleId = (lesson: Lesson) => {
    if (lesson.moduleId) return lesson.moduleId;
    const parent = modules.find((m) =>
      m.lessons.some((l) => l.id === lesson.id),
    );
    return parent?.id || "";
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FDFCF9] overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <Link
            href={course.backLink}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-primary text-sm md:text-base line-clamp-1">
              {course.title}
            </h1>
            {activeLesson && (
              <p className="text-xs text-stone-500 hidden md:block">
                {activeLesson.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-stone-50 rounded-lg text-primary md:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-stone-50 rounded-lg transition-colors border border-stone-100"
          >
            {sidebarOpen ? "Expandir Tela" : "Ver Conteúdo"}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/5 relative">
          <div className="max-w-5xl mx-auto w-full min-h-full flex flex-col">
            {/* Video Section */}
            <div
              className={cn(
                "w-full bg-black transition-all duration-300 ease-in-out",
                sidebarOpen
                  ? "aspect-video md:aspect-video"
                  : "aspect-video md:h-[60vh]",
              )}
            >
              {activeLesson && (
                <CourseVideoWrapper
                  courseId={course.id}
                  moduleId={getModuleId(activeLesson)} // Pass Module ID
                  lesson={activeLesson}
                  onMarkComplete={onMarkComplete}
                  initialMaxWatchedSecond={initialMaxWatchedSecond}
                  onVideoCompleted={onVideoCompleted}
                />
              )}
            </div>

            {/* Lesson Content */}
            <div className="flex-1 bg-[#FDFCF9] p-6 md:p-12">
              {activeLesson ? (
                <div className="space-y-8 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 pb-8">
                    <div>
                      <h2 className="font-serif text-3xl text-primary mb-2">
                        {activeLesson.title}
                      </h2>
                      <p className="text-stone-500 font-light text-sm">
                        Atualizado em 12 de Jan
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeLesson.isCompleted ? (
                        <Button
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          disabled
                          leftIcon={<CheckCircle size={16} />}
                        >
                          Concluída
                        </Button>
                      ) : (
                        // Verify if we should hide this too (VP-01)
                        // Assuming this Player uses its own Video checking, but manual override exists.
                        // Let's keep it consistent with LessonPlayer and HIDE if video.
                        // Condition: !isCompleted && type != 'video'
                        activeLesson.type !== "video" && (
                          <Button
                            onClick={() =>
                              onMarkComplete(
                                activeLesson.id,
                                getModuleId(activeLesson),
                              )
                            }
                            variant="primary"
                          >
                            Marcar como Concluída
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-stone max-w-none">
                    {(activeLesson as any).description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: (activeLesson as any).description,
                        }}
                      />
                    ) : (
                      <p className="text-stone-400 italic">
                        Sem descrição para esta aula.
                      </p>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-12 border-t border-stone-100">
                    <Button
                      variant="ghost"
                      disabled={!prevLessonId}
                      onClick={() =>
                        prevLessonId && onSelectLesson(prevLessonId)
                      }
                      leftIcon={<ChevronLeft size={16} />}
                    >
                      Aula Anterior
                    </Button>

                    <Button
                      variant="ghost"
                      disabled={!nextLessonId}
                      onClick={() =>
                        nextLessonId && onSelectLesson(nextLessonId)
                      }
                      rightIcon={<ChevronRight size={16} />}
                    >
                      Próxima Aula
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <EmptyState
                    icon={<Menu size={32} />}
                    title="Selecione uma Aula"
                    description="Escolha um dos tópicos no menu lateral para iniciar seus estudos."
                    className="bg-transparent border-none shadow-none"
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            "absolute md:relative right-0 top-0 bottom-0 z-10 w-full md:w-96 bg-white shadow-2xl md:shadow-none transition-all duration-300 ease-in-out transform",
            sidebarOpen
              ? "translate-x-0"
              : "translate-x-full md:w-0 overflow-hidden",
          )}
        >
          <LessonSidebar
            modules={modules}
            currentLessonId={activeLesson?.id || ""}
            onSelectLesson={onSelectLesson}
          />
        </aside>
      </div>
    </div>
  );
};
