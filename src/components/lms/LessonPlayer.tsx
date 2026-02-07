"use client";

import { useEffect, useState } from 'react';
import { Lesson, Module, Block } from '@/types/lms';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Menu, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Button from "../ui/Button";
import { cn } from "@/lib/utils";
import { LessonSidebar } from "../portal/LessonSidebar"; // We can reuse existing sidebar
import { BlockRenderer } from './BlockRenderer';
import { getLessonContentAction } from '@/app/actions/lms';

interface LessonPlayerProps {
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
}

export function LessonPlayer({
    course,
    modules,
    activeLesson,
    onSelectLesson,
    onMarkComplete,
    nextLessonId,
    prevLessonId,
}: LessonPlayerProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    // Helper to find moduleId if not directly on lesson
    const getModuleId = (lesson: Lesson) => {
        if (lesson.moduleId) return lesson.moduleId;
        const parent = modules.find(m => m.lessons.some(l => l.id === lesson.id));
        return parent?.id;
    };

    // Resolved moduleId for the active lesson (needed to load blocks)
    const resolvedModuleId = activeLesson ? getModuleId(activeLesson) : undefined;

    // Load lesson content blocks whenever the active lesson changes
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeLesson || !resolvedModuleId) {
                setBlocks([]);
                return;
            }

            setIsLoadingContent(true);
            try {
                const res = await getLessonContentAction(course.id, resolvedModuleId, activeLesson.id);

                if (cancelled) return;

                if (res?.success) {
                    const serverBlocks = (res.data?.blocks || []) as Block[];
                    // Default visible; only hide if explicitly disabled
                    setBlocks(serverBlocks.filter(b => b.isPublished !== false));
                } else {
                    console.error('Failed to load lesson content:', res?.error);
                    setBlocks([]);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load lesson content:', err);
                    setBlocks([]);
                }
            } finally {
                if (!cancelled) setIsLoadingContent(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeLesson?.id, resolvedModuleId, course.id]);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FDFCF9] overflow-hidden">
            {/* Top Bar (Simplified for focus) */}
            <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 shrink-0 z-20 relative shadow-sm">
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
                    <Button
                        onClick={() => {
                            const modId = activeLesson ? getModuleId(activeLesson) : undefined;
                            if (activeLesson && modId) onMarkComplete(activeLesson.id, modId);
                        }}
                        disabled={!activeLesson || activeLesson.isCompleted}
                        size="sm"
                        variant={activeLesson?.isCompleted ? "outline" : "primary"}
                        className={cn(
                            "hidden md:flex",
                            activeLesson?.isCompleted && "text-green-600 border-green-200 bg-green-50",
                            // VP-01: Hide manual completion for video lessons to enforce watch threshold
                            activeLesson?.type === 'video' && !activeLesson.isCompleted && "hidden"
                        )}
                        leftIcon={activeLesson?.isCompleted ? <CheckCircle size={14} /> : undefined}
                    >
                        {activeLesson?.isCompleted ? "Concluída" : "Concluir Aula"}
                    </Button>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden md:flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                    >
                        {sidebarOpen ? 'Expandir' : 'Conteúdo'}
                    </button>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-stone-50 rounded-lg text-primary md:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-white relative flex flex-col">

                    {activeLesson ? (
                        <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pb-32">
                            {/* Lesson Header */}
                            <div className="mb-8 border-b border-stone-100 pb-6">
                                <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold mb-4">{activeLesson.title}</h1>
                                {isLoadingContent && <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 className="animate-spin" size={14} /> Carregando conteúdo...</div>}
                            </div>

                            {/* Blocks Render */}
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {blocks.map((block) => (
                                    <BlockRenderer
                                        key={block.id}
                                        block={block}
                                        courseId={course.id}
                                        moduleId={getModuleId(activeLesson)} // Pass Resolved Module ID
                                        lessonId={activeLesson.id}
                                        isLessonCompleted={activeLesson.isCompleted}
                                    />
                                ))}
                                {!isLoadingContent && blocks.length === 0 && (
                                    <div className="bg-stone-50 rounded-xl p-8 text-center text-stone-400 italic">
                                        Nenhum conteúdo disponível para esta aula.
                                    </div>
                                )}
                            </div>

                            {/* Navigation Footer */}
                            <div className="flex items-center justify-between pt-16 mt-16 border-t border-stone-100">
                                <Button
                                    variant="ghost"
                                    disabled={!prevLessonId}
                                    onClick={() => prevLessonId && onSelectLesson(prevLessonId)}
                                    leftIcon={<ChevronLeft size={16} />}
                                    className="text-stone-500 hover:text-primary"
                                >
                                    Anterior
                                </Button>

                                <div className="hidden md:flex gap-2">
                                    {!activeLesson.isCompleted && activeLesson.type !== 'video' && (
                                        <Button onClick={() => {
                                            const modId = getModuleId(activeLesson);
                                            if (modId) onMarkComplete(activeLesson.id, modId);
                                        }}>
                                            Marcar como Concluída
                                        </Button>
                                    )}
                                    {nextLessonId && (
                                        <Button
                                            onClick={() => nextLessonId && onSelectLesson(nextLessonId)}
                                            rightIcon={<ChevronRight size={16} />}
                                        >
                                            Próxima Aula
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    disabled={!nextLessonId}
                                    onClick={() => nextLessonId && onSelectLesson(nextLessonId)}
                                    rightIcon={<ChevronRight size={16} />}
                                    className="md:hidden text-stone-500 hover:text-primary"
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-stone-400">
                            Selecione uma aula no menu ao lado.
                        </div>
                    )}
                </main>

                {/* Sidebar */}
                <aside
                    className={cn(
                        "absolute md:relative right-0 top-0 bottom-0 z-10 w-full md:w-80 bg-stone-50/50 border-l border-stone-100 backdrop-blur-sm transition-all duration-300 ease-in-out transform",
                        sidebarOpen ? "translate-x-0" : "translate-x-full md:w-0 overflow-hidden border-none"
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
}
