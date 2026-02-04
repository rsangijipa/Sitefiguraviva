"use client";

import { useState } from 'react';
import { CourseDoc } from '@/types/lms';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Layout, List, Users, MessageSquare, Settings, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';
import { useToast } from '@/context/ToastContext';
import { adminCourseService } from '@/services/adminCourseService';
// Dynamic import or regular depending on usage
import CourseCurriculumTab from './tabs/CourseCurriculumTab';
import CourseStudentsTab from './tabs/CourseStudentsTab';
import CourseCommunityTab from './tabs/CourseCommunityTab';
import CourseAnnouncementsTab from './tabs/CourseAnnouncementsTab';
import CourseMaterialsTab from './tabs/CourseMaterialsTab';
import CourseSettingsTab from './tabs/CourseSettingsTab';

// Placeholder sub-components (will create iteratively)
// import CourseInfoTab from './tabs/CourseInfoTab';
// import CourseContentTab from './tabs/Course/CourseContentTab';
// import CourseStudentsTab from './tabs/CourseStudentsTab';
// import CourseCommunityTab from './tabs/CourseCommunityTab'; 

export default function CourseEditorClient({ initialCourse }: { initialCourse: CourseDoc }) {
    const searchParams = useSearchParams();
    const router = useRouter(); // Imported from next/navigation
    const { addToast } = useToast();
    const [course, setCourse] = useState<CourseDoc>(initialCourse);

    // Tab State with URL sync
    const initialTab = searchParams.get('tab') || 'info';
    const [activeTab, setActiveTabState] = useState(initialTab);

    const setActiveTab = (tab: string) => {
        setActiveTabState(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`/admin/courses/${course.id}?${params.toString()}`, { scroll: false });
    };
    const [isSaving, setIsSaving] = useState(false);

    // Save handler (Global for Info tab, but specific tabs might have own saves)
    const handleSaveCourse = async () => {
        setIsSaving(true);
        try {
            await adminCourseService.updateCourse(course.id, {
                title: course.title,
                subtitle: course.subtitle,
                description: course.description,
                coverImage: course.coverImage,
                status: course.status,
                // ... map other fields
            });
            addToast("Curso salvo com sucesso", 'success');
        } catch (error) {
            addToast("Erro ao salvar", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses" className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-serif text-2xl text-stone-800 font-bold">{course.title || 'Novo Curso'}</h1>
                        <div className="flex items-center gap-2 text-xs text-stone-400 font-bold uppercase tracking-widest">
                            <span className={cn("w-2 h-2 rounded-full", course.status === 'open' ? 'bg-green-500' : 'bg-stone-300')} />
                            {course.status}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open(`/portal/course/${course.id}`, '_blank')}>
                        Ver no Portal
                    </Button>
                    <Button onClick={handleSaveCourse} isLoading={isSaving} leftIcon={<Save size={16} />}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-stone-100 sticky top-0 z-20 mb-8 flex overflow-x-auto no-scrollbar">
                {[
                    { id: 'info', label: 'Informações', icon: Layout },
                    { id: 'curriculum', label: 'Curriculum', icon: List },
                    { id: 'students', label: 'Alunos', icon: Users },
                    { id: 'materials', label: 'Materiais', icon: FileText },
                    { id: 'community', label: 'Comunidade', icon: MessageSquare },
                    { id: 'settings', label: 'Configurações', icon: Settings },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
                            activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-stone-500 hover:text-stone-800"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-5xl mx-auto">
                {activeTab === 'info' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 block">Capa do Curso</label>
                            <ImageUpload
                                defaultImage={course.coverImage || ''}
                                onUpload={(url) => setCourse({ ...course, coverImage: url })}
                                folder="courses/covers"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Título do Curso</label>
                                <input
                                    value={course.title || ''}
                                    onChange={e => setCourse({ ...course, title: e.target.value })}
                                    className="w-full text-xl font-serif font-bold p-4 bg-stone-50 rounded-xl border-transparent focus:bg-white focus:border-primary border transition-all outline-none"
                                    placeholder="Ex: Mestrado em.."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Subtítulo</label>
                                <input
                                    value={course.subtitle || ''}
                                    onChange={e => setCourse({ ...course, subtitle: e.target.value })}
                                    className="w-full p-4 bg-stone-50 rounded-xl border-transparent focus:bg-white focus:border-primary border transition-all outline-none"
                                    placeholder="Uma frase de efeito..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Descrição Curta</label>
                                <textarea
                                    value={course.description || ''}
                                    onChange={e => setCourse({ ...course, description: e.target.value })}
                                    rows={4}
                                    className="w-full p-4 bg-stone-50 rounded-xl border-transparent focus:bg-white focus:border-primary border transition-all outline-none resize-none"
                                    placeholder="Resumo para o card..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && <CourseCurriculumTab courseId={course.id} />}
                {activeTab === 'students' && <CourseStudentsTab courseId={course.id} />}
                {activeTab === 'materials' && <CourseMaterialsTab courseId={course.id} />}
                {activeTab === 'community' && <CourseCommunityTab courseId={course.id} />}
                {activeTab === 'settings' && <CourseSettingsTab course={course} />}
            </div>
        </div>
    );
}
