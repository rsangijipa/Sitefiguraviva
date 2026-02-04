import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock, PlayCircle, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { Lesson, Module } from "@/types/lms";

interface LessonSidebarProps {
    modules: Module[];
    currentLessonId: string;
    onSelectLesson: (lessonId: string) => void;
    className?: string;
}

export const LessonSidebar = ({ modules, currentLessonId, onSelectLesson, className }: LessonSidebarProps) => {
    // Determine which module is initially open based on current lesson
    const initialOpenModule = modules.find(m => m.lessons.some(l => l.id === currentLessonId))?.id || modules[0]?.id;
    const [openModules, setOpenModules] = useState<string[]>(initialOpenModule ? [initialOpenModule] : []);

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-white border-l border-stone-100", className)}>
            <div className="p-6 border-b border-stone-100">
                <h3 className="font-serif text-xl text-primary">Conteúdo do Curso</h3>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-bold">
                    {modules.reduce((acc, m) => acc + m.lessons.filter(l => l.isCompleted).length, 0)} / {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Aulas concluídas
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {modules.map((module) => {
                    const isOpen = openModules.includes(module.id);
                    const completedCount = module.lessons.filter(l => l.isCompleted).length;
                    const totalCount = module.lessons.length;
                    const isCompleted = completedCount === totalCount && totalCount > 0;

                    return (
                        <div key={module.id} className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50/50">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors text-left"
                            >
                                <div>
                                    <h4 className="font-bold text-sm text-primary">{module.title}</h4>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                        {completedCount}/{totalCount} Aulas
                                    </p>
                                </div>
                                <div className="text-stone-400">
                                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                                        <div className="p-2 space-y-1">
                                            {module.lessons.map((lesson) => {
                                                const isActive = lesson.id === currentLessonId;
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                                                        disabled={lesson.isLocked}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm group",
                                                            isActive
                                                                ? "bg-primary text-white shadow-md"
                                                                : "hover:bg-white hover:shadow-sm text-stone-600",
                                                            lesson.isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "shrink-0",
                                                            isActive ? "text-gold" : "text-stone-300 group-hover:text-primary/40"
                                                        )}>
                                                            {lesson.isLocked ? (
                                                                <Lock size={16} />
                                                            ) : lesson.isCompleted ? (
                                                                <CheckCircle2 size={16} className="text-green-500" />
                                                            ) : (
                                                                <PlayCircle size={16} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={cn("font-medium line-clamp-2", isActive ? "text-white" : "")}>
                                                                {lesson.title}
                                                            </p>
                                                            {lesson.duration && (
                                                                <p className={cn("text-[10px] mt-0.5 opacity-60", isActive ? "text-white" : "")}>
                                                                    {lesson.duration}
                                                                </p>
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
