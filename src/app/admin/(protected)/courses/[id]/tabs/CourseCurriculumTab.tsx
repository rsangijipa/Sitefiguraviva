"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminCourseService } from '@/services/adminCourseService';
import { ModuleDoc, LessonDoc } from '@/types/lms';
import { Plus, GripVertical, Trash2, Edit, ChevronDown, ChevronRight, FileText, Video } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// We will need a LessonEditor Modal/Drawer later. For now, skeleton.

export default function CourseCurriculumTab({ courseId }: { courseId: string }) {
    const router = useRouter();
    const { addToast } = useToast();
    const [modules, setModules] = useState<ModuleDoc[]>([]);
    const [lessonsMap, setLessonsMap] = useState<Record<string, LessonDoc[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

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
            sortedMods.forEach(m => expanded[m.id] = true);
            setExpandedModules(expanded);

            // Fetch lessons for each module
            const lMap: Record<string, LessonDoc[]> = {};
            await Promise.all(sortedMods.map(async m => {
                const lessons = await adminCourseService.getLessons(courseId, m.id);
                lMap[m.id] = lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
            }));
            setLessonsMap(lMap);

        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar currículo", 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (modId: string) => {
        setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    const handleCreateModule = async () => {
        const title = prompt("Nome do novo módulo:");
        if (!title) return;
        try {
            await adminCourseService.createModule(courseId, title, modules.length);
            addToast("Módulo criado", 'success');
            loadModules();
        } catch (e) {
            addToast("Erro ao criar módulo", 'error');
        }
    };

    const handleCreateLesson = async (moduleId: string) => {
        const title = prompt("Título da nova aula:");
        if (!title) return;
        try {
            const currentCount = lessonsMap[moduleId]?.length || 0;
            await adminCourseService.createLesson(courseId, moduleId, title, currentCount);
            addToast("Aula criada", 'success');
            loadModules(); // Or just reload that module's lessons
        } catch (e) {
            addToast("Erro ao criar aula", 'error');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Excluir módulo? Aulas serão perdidas.")) return;
        try {
            await adminCourseService.deleteModule(courseId, moduleId);
            loadModules();
        } catch (e) { addToast("Erro ao excluir", 'error'); }
    };

    // Navigate to the Block Editor
    const handleEditLesson = (moduleId: string, lessonId: string) => {
        router.push(`/admin/courses/${courseId}/lessons/${lessonId}`);
    };

    if (loading) return <div className="p-8 text-center text-stone-400">Carregando estrutura...</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-700">Estrutura do Curso</h3>
                <Button onClick={handleCreateModule} leftIcon={<Plus size={16} />}>Adicionar Módulo</Button>
            </div>

            <div className="space-y-4">
                {modules.map((module, idx) => (
                    <div key={module.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Module Header */}
                        <div className="bg-stone-50 p-4 flex items-center gap-3 border-b border-stone-100 group">
                            <button onClick={() => toggleModule(module.id)} className="p-1 hover:bg-stone-200 rounded text-stone-400">
                                {expandedModules[module.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span className="font-mono text-xs text-stone-400 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">MÚDULO {idx + 1}</span>
                            <span className={cn("font-bold flex-1 transition-colors", module.isPublished ? "text-stone-700" : "text-stone-400 italic")}>{module.title}</span>

                            {/* Publish Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Optimistic update
                                    const newStatus = !module.isPublished;
                                    setModules(modules.map(m => m.id === module.id ? { ...m, isPublished: newStatus } : m));
                                    adminCourseService.updateModule(courseId, module.id, { isPublished: newStatus })
                                        .catch(() => {
                                            addToast("Erro ao atualizar", 'error');
                                            loadModules(); // Revert on error
                                        });
                                }}
                                className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors mr-2",
                                    module.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                                )}
                            >
                                {module.isPublished ? 'Publicado' : 'Rascunho'}
                            </button>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleDeleteModule(module.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                <button className="cursor-move p-2 text-stone-400 hover:text-stone-600"><GripVertical size={14} /></button>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <AnimatePresence>
                            {expandedModules[module.id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-white"
                                >
                                    <div className="divide-y divide-stone-50">
                                        {(lessonsMap[module.id] || []).map((lesson, lIdx) => (
                                            <div key={lesson.id} className="p-3 pl-12 flex items-center gap-4 hover:bg-blue-50/30 transition-colors group">
                                                <span className="text-stone-300 font-mono text-xs">{lIdx + 1}.</span>
                                                <div className="w-8 h-8 rounded bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                                                    {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                                                </div>
                                                <span className="text-sm font-medium text-stone-700 flex-1">{lesson.title}</span>

                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEditLesson(module.id, lesson.id)} leftIcon={<Edit size={12} />}>
                                                        Conteúdo
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 pl-12">
                                        <button
                                            onClick={() => handleCreateLesson(module.id)}
                                            className="w-full py-2 border-2 border-dashed border-stone-100 rounded-lg text-stone-400 text-xs font-bold uppercase hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Adicionar Aula
                                        </button>
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
