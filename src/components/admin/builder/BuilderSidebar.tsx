"use client";

import { useState } from 'react';
import { Module, Lesson } from '@/types/lms';
import { Plus, GripVertical, ChevronRight, ChevronDown, FileText, Video, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface BuilderSidebarProps {
    modules: Module[];
    activeLessonId?: string;
    onSelectLesson: (moduleId: string, lessonId: string) => void;
    onAddModule: () => void;
    onAddLesson: (moduleId: string) => void;
    onReorder: (newModules: Module[]) => void;
}

export function BuilderSidebar({ modules, activeLessonId, onSelectLesson, onAddModule, onAddLesson }: BuilderSidebarProps) {
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    return (
        <aside className="w-80 border-r border-stone-100 bg-stone-50/50 flex flex-col h-full">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white">
                <h2 className="font-serif font-bold text-stone-700">Estrutura</h2>
                <Button onClick={onAddModule} size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Plus size={18} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {modules.map((module) => (
                    <div key={module.id} className="group">
                        {/* Module Header */}
                        <div className="flex items-center gap-2 p-2 hover:bg-stone-100 rounded-lg group/module transition-colors">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="p-1 text-stone-400 hover:text-stone-600"
                            >
                                {expandedModules[module.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <GripVertical size={14} className="text-stone-300 cursor-grab opacity-0 group-hover/module:opacity-100" />
                            <span className="flex-1 font-bold text-sm text-stone-700 truncate">{module.title}</span>
                            <div className="flex items-center opacity-0 group-hover/module:opacity-100">
                                <Button onClick={() => onAddLesson(module.id)} size="sm" variant="ghost" className="h-6 w-6 p-0 text-stone-400 hover:text-primary">
                                    <Plus size={14} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-stone-400 hover:text-primary">
                                    <MoreVertical size={14} />
                                </Button>
                            </div>
                        </div>

                        {/* Lessons List */}
                        {expandedModules[module.id] && (
                            <div className="ml-6 pl-2 border-l border-stone-200 mt-1 space-y-1">
                                {module.lessons?.map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => onSelectLesson(module.id, lesson.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                                            activeLessonId === lesson.id
                                                ? "bg-white shadow-sm border border-stone-100 text-primary"
                                                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                                        )}
                                    >
                                        <GripVertical size={12} className={cn("text-stone-300 opacity-0 group-hover:opacity-100", activeLessonId === lesson.id && "opacity-50")} />
                                        <div className={cn("text-[10px] font-bold uppercase tracking-wider border rounded px-1", lesson.isPublished ? "border-green-200 text-green-600 bg-green-50" : "border-stone-200 text-stone-400")}>
                                            {lesson.isPublished ? "ON" : "OFF"}
                                        </div>
                                        <span className="truncate text-sm font-medium flex-1">{lesson.title}</span>
                                    </button>
                                ))}
                                {(!module.lessons || module.lessons.length === 0) && (
                                    <div className="p-2 text-xs text-stone-400 italic">
                                        Nenhuma aula
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
