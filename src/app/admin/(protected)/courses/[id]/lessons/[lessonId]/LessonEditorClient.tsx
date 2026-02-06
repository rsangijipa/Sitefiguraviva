"use client";

import { useState } from 'react';
import { CourseDoc, ModuleDoc, Lesson, Block } from '@/types/lms';
import BlockEditor from '@/components/admin/BlockEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updateLessonBlocksAction } from '@/app/actions/lms';
import { useToast } from '@/context/ToastContext';

export default function LessonEditorClient({
    course,
    module,
    initialLesson
}: {
    course: CourseDoc;
    module: ModuleDoc;
    initialLesson: Lesson;
}) {
    const { addToast: showToast } = useToast();
    const [lesson, setLesson] = useState(initialLesson);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (blocks: Block[]) => {
        setIsSaving(true);
        try {
            // Normalize blocks: ensure order + default publish state
            const normalized = (blocks || []).map((b: any, idx: number) => ({
                ...b,
                order: typeof b?.order === 'number' ? b.order : idx + 1,
                isPublished: b?.isPublished !== false,
            })) as Block[];

            const res = await updateLessonBlocksAction(course.id, module.id, lesson.id, normalized);

            if (!res?.success) {
                throw new Error(res?.error || 'Falha ao salvar blocos');
            }

            setLesson(prev => ({ ...prev, blocks: normalized }));
            showToast('Conteúdo salvo e publicado para alunos!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar o conteúdo.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF9] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-stone-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/courses/${course.id}`} className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-stone-400 font-bold uppercase tracking-widest">
                            <span>{course.title}</span>
                            <span>/</span>
                            <span>{module.title}</span>
                        </div>
                        <h1 className="font-serif text-xl text-stone-800 font-bold">{lesson.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-stone-300 font-mono hidden md:inline-block">Auto-save: OFF</span>
                </div>
            </div>

            {/* Editor Area */}
            <div className="max-w-4xl mx-auto py-12 px-4">
                <BlockEditor
                    initialBlocks={lesson.blocks || []}
                    onSave={handleSave}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
