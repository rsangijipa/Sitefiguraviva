"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BuilderSidebar } from '@/components/admin/builder/BuilderSidebar';
import { LessonEditor } from '@/components/admin/builder/LessonEditor';
import { Module, Lesson } from '@/types/lms';
import { useCourses } from '@/hooks/useContent';
import { Loader2 } from 'lucide-react';

export default function BuilderPage() {
    const params = useParams();
    const courseId = params.id as string;

    // In a real implementation, we would fetch the detailed course structure here w/ blocks
    // For sprint 1 MVP, we simulate or fetch basic structure
    const { data: courses } = useCourses();
    const [modules, setModules] = useState<Module[]>([]);

    // Selection State
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Mock Load (replace with real fetch later)
    useEffect(() => {
        if (courses) {
            // Transform or load. 
            // Since useCourses only returns course list, usually we need a deeper fetch.
            // For now, let's just scaffolding empty state or use what we have if any.
            setModules([
                {
                    id: 'm1', courseId, title: 'Módulo 1: Introdução', order: 1, isPublished: true,
                    lessons: [
                        { id: 'l1', moduleId: 'm1', courseId, title: 'Boas Vindas', order: 1, isPublished: true, videoUrl: '', type: 'video' },
                        { id: 'l2', moduleId: 'm1', courseId, title: 'Visão Geral', order: 2, isPublished: false, videoUrl: '', type: 'video' }
                    ]
                }
            ]);
        }
    }, [courses, courseId]);

    const handleSelectLesson = (moduleId: string, lessonId: string) => {
        setActiveModuleId(moduleId);
        setActiveLessonId(lessonId);
    };

    return (
        <div className="flex h-full w-full">
            <BuilderSidebar
                modules={modules}
                activeLessonId={activeLessonId || undefined}
                onSelectLesson={handleSelectLesson}
                onAddModule={() => { }}
                onAddLesson={() => { }}
                onReorder={() => { }}
            />

            {activeLessonId && activeModuleId ? (
                <LessonEditor
                    moduleId={activeModuleId}
                    lessonId={activeLessonId}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-300 bg-stone-50/30">
                    <p>Selecione uma aula para começar a editar</p>
                </div>
            )}
        </div>
    );
}
