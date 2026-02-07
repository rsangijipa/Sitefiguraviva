import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { LessonSidebar } from "./LessonSidebar";
import { Lesson, Module } from "@/types/lms";
import Button from "../ui/Button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

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
}

// Wrapper component to isolate hook usage per lesson
// Wrapper component to isolate hook usage per lesson
const CourseVideoWrapper = ({ courseId, moduleId, lesson, onMarkComplete }: { courseId: string, moduleId: string, lesson: Lesson, onMarkComplete: (id: string, modId: string) => void }) => {
    // FIX: useProgress now requires moduleId (PRG-02)
    const { progress, updateProgress, triggerSync } = useProgress(courseId, moduleId, lesson.id);

    const [isPlaying, setIsPlaying] = useState(false);

    // VP-03: Heartbeat Sync (Every 10s) optimized
    useEffect(() => {
        if (!isPlaying) return; // Only poll if playing

        const interval = setInterval(() => {
            triggerSync();
        }, 10000);
        return () => clearInterval(interval);
    }, [isPlaying, triggerSync]);

    return (
        <VideoPlayer
            url={lesson.type === 'video' ? (lesson as any).videoUrl : ''}
            poster={(lesson as any).thumbnail}
            initialTime={progress?.seekPosition || 0}
            onTimeUpdate={(t) => { updateProgress(t, false); }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
                setIsPlaying(false);
                triggerSync();
            }}
            onEnded={() => {
                setIsPlaying(false);
                triggerSync();
                onMarkComplete(lesson.id, moduleId);
            }}
        // We need to pass onPlay logic.
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
    loading = false
}: CoursePlayerProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (loading) return null; // Or skeleton

    // Helper to resolve Module ID
    const getModuleId = (lesson: Lesson) => {
        if (lesson.moduleId) return lesson.moduleId;
        const parent = modules.find(m => m.lessons.some(l => l.id === lesson.id));
        return parent?.id || '';
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FDFCF9] overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 shrink-0 z-20 relative">
                <div className="flex items-center gap-4">
                    <Link href={course.backLink} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-400 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-primary text-sm md:text-base line-clamp-1">{course.title}</h1>
                        {activeLesson && <p className="text-xs text-stone-500 hidden md:block">{activeLesson.title}</p>}
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
                        {sidebarOpen ? 'Expandir Tela' : 'Ver Conteúdo'}
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/5 relative">
                    <div className="max-w-5xl mx-auto w-full min-h-full flex flex-col">

                        {/* Video Section */}
                        <div className={cn(
                            "w-full bg-black transition-all duration-300 ease-in-out",
                            sidebarOpen ? "aspect-video md:aspect-video" : "aspect-video md:h-[60vh]"
                        )}>
                            {activeLesson && (
                                <CourseVideoWrapper
                                    courseId={course.id}
                                    moduleId={getModuleId(activeLesson)} // Pass Module ID
                                    lesson={activeLesson}
                                    onMarkComplete={onMarkComplete}
                                />
                            )}
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 bg-[#FDFCF9] p-6 md:p-12">
                            {activeLesson ? (
                                <div className="space-y-8 max-w-4xl mx-auto">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 pb-8">
                                        <div>
                                            <h2 className="font-serif text-3xl text-primary mb-2">{activeLesson.title}</h2>
                                            <p className="text-stone-500 font-light text-sm">Atualizado em 12 de Jan</p>
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
                                                activeLesson.type !== 'video' && (
                                                    <Button
                                                        onClick={() => onMarkComplete(activeLesson.id, getModuleId(activeLesson))}
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
                                            <div dangerouslySetInnerHTML={{ __html: (activeLesson as any).description }} />
                                        ) : (
                                            <p className="text-stone-400 italic">Sem descrição para esta aula.</p>
                                        )}
                                    </div>

                                    {/* Navigation Footer */}
                                    <div className="flex items-center justify-between pt-12 border-t border-stone-100">
                                        <Button
                                            variant="ghost"
                                            disabled={!prevLessonId}
                                            onClick={() => prevLessonId && onSelectLesson(prevLessonId)}
                                            leftIcon={<ChevronLeft size={16} />}
                                        >
                                            Aula Anterior
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            disabled={!nextLessonId}
                                            onClick={() => nextLessonId && onSelectLesson(nextLessonId)}
                                            rightIcon={<ChevronRight size={16} />}
                                        >
                                            Próxima Aula
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-stone-400">
                                    <p>Selecione uma aula para começar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside
                    className={cn(
                        "absolute md:relative right-0 top-0 bottom-0 z-10 w-full md:w-96 bg-white shadow-2xl md:shadow-none transition-all duration-300 ease-in-out transform",
                        sidebarOpen ? "translate-x-0" : "translate-x-full md:w-0 overflow-hidden"
                    )}
                >
                    <LessonSidebar
                        modules={modules}
                        currentLessonId={activeLesson?.id || ''}
                        onSelectLesson={onSelectLesson}
                    />
                </aside>
            </div>
        </div>
    );
};
