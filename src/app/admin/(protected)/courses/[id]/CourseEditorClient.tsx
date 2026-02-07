"use client";

import { useState, useEffect } from 'react';
import { CourseDoc } from '@/types/lms';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Save, Layout, List, Users, MessageSquare, Settings, FileText,
    Eye, EyeOff, ExternalLink, Clock, BookOpen, GraduationCap, BarChart3,
    Trash2, Image as ImageIcon, ChevronRight, Bell
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';
import { useToast } from '@/context/ToastContext';
import { adminCourseService } from '@/services/adminCourseService';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCurriculumTab from './tabs/CourseCurriculumTab';
import CourseStudentsTab from './tabs/CourseStudentsTab';
import CourseCommunityTab from './tabs/CourseCommunityTab';
import CourseAnnouncementsTab from './tabs/CourseAnnouncementsTab';
import CourseMaterialsTab from './tabs/CourseMaterialsTab';
import CourseSettingsTab from './tabs/CourseSettingsTab';
import { toggleCourseStatus } from '@/app/actions/admin-publishing';

const TABS = [
    { id: 'info', label: 'Informações', icon: Layout, description: 'Dados básicos do curso' },
    { id: 'curriculum', label: 'Curriculum', icon: List, description: 'Módulos e aulas' },
    { id: 'students', label: 'Alunos', icon: Users, description: 'Matrículas e progresso' },
    { id: 'materials', label: 'Materiais', icon: FileText, description: 'Downloads e recursos' },
    { id: 'announcements', label: 'Avisos', icon: Bell, description: 'Comunicados' },
    { id: 'community', label: 'Comunidade', icon: MessageSquare, description: 'Fórum e discussões' },
    { id: 'settings', label: 'Configurações', icon: Settings, description: 'Avançado' },
];

export default function CourseEditorClient({ initialCourse }: { initialCourse: CourseDoc }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();
    const [course, setCourse] = useState<CourseDoc>(initialCourse);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    const [isPublishing, setIsPublishing] = useState(false);

    // Track changes
    const updateCourse = (updates: Partial<CourseDoc>) => {
        setCourse(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    };

    // Save handler
    const handleSaveCourse = async () => {
        setIsSaving(true);
        try {
            await adminCourseService.updateCourse(course.id, course);
            addToast("Curso salvo com sucesso!", 'success');
            setHasUnsavedChanges(false);
        } catch (error) {
            addToast("Erro ao salvar", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Publish/Unpublish handler
    const handleTogglePublish = async () => {
        setIsPublishing(true);
        try {
            const result: any = await toggleCourseStatus(course.id, course.status);
            if (result.success) {
                setCourse({ ...course, status: result.newStatus, isPublished: result.isPublished });
                addToast(
                    result.newStatus === 'open' ? "🎉 Curso Publicado!" : "Curso despublicado",
                    'success'
                );
            } else {
                addToast("Erro: " + result.error, 'error');
            }
        } catch (e) {
            addToast("Erro de conexão", 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    // Get current tab info
    const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
        <div className="min-h-screen bg-stone-50 overflow-auto">
            {/* Premium Header */}
            <header className="bg-white border-b border-stone-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-2">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/courses"
                                className="flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all text-sm"
                            >
                                <ArrowLeft size={18} />
                                <span className="hidden sm:inline">Voltar</span>
                            </Link>

                            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {/* Course Image Thumbnail */}
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                    {course.coverImage ? (
                                        <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <BookOpen size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="font-serif text-base sm:text-lg md:text-xl text-stone-800 font-bold line-clamp-1 truncate">
                                        {course.title || 'Novo Curso'}
                                    </h1>
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-400">
                                        <span className={cn(
                                            "flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px] sm:text-xs",
                                            course.status === 'open'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-stone-100 text-stone-600'
                                        )}>
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                course.status === 'open' ? 'bg-green-500' : 'bg-stone-400'
                                            )} />
                                            {course.status === 'open' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                        {course.stats?.studentsCount !== undefined && (
                                            <span className="hidden sm:flex items-center gap-1">
                                                <Users size={12} />
                                                {course.stats.studentsCount} alunos
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Unsaved changes indicator */}
                            {hasUnsavedChanges && (
                                <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                    Alterações não salvas
                                </span>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/portal/course/${course.id}`, '_blank')}
                                className="hidden sm:flex"
                            >
                                <ExternalLink size={16} />
                                <span className="ml-2">Preview</span>
                            </Button>

                            <Button
                                variant={course.status === 'open' ? 'ghost' : 'outline'}
                                size="sm"
                                onClick={handleTogglePublish}
                                isLoading={isPublishing}
                                className={cn(
                                    course.status === 'open'
                                        ? 'text-orange-600 hover:bg-orange-50'
                                        : 'text-green-600 border-green-200 hover:bg-green-50'
                                )}
                            >
                                {course.status === 'open' ? <EyeOff size={16} /> : <Eye size={16} />}
                                <span className="ml-2 hidden sm:inline">
                                    {course.status === 'open' ? 'Despublicar' : 'Publicar'}
                                </span>
                            </Button>

                            <Button
                                onClick={handleSaveCourse}
                                isLoading={isSaving}
                                size="sm"
                                className="shadow-lg shadow-primary/20"
                            >
                                <Save size={16} />
                                <span className="ml-2">Salvar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Tabs Navigation - with visible scrollbar on mobile */}
                    <div className="flex overflow-x-auto px-4 md:px-6 -mb-px scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary text-primary bg-primary/5"
                                        : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24">
                {/* Tab Header with breadcrumb */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-400 mb-2">
                        <span>Curso</span>
                        <ChevronRight size={14} />
                        <span className="text-stone-600">{currentTab.label}</span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl text-stone-800">{currentTab.label}</h2>
                    <p className="text-stone-500 text-xs sm:text-sm mt-1">{currentTab.description}</p>
                </div>

                {/* Tab Content with animations */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'info' && (
                            <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                {/* Left Column - Image */}
                                <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
                                    <div className="bg-white rounded-xl md:rounded-2xl border border-stone-100 p-4 md:p-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 md:mb-4 block">
                                            Capa do Curso
                                        </label>
                                        <div className="aspect-video rounded-xl overflow-hidden bg-stone-100 mb-4 relative group">
                                            {course.coverImage ? (
                                                <>
                                                    <img
                                                        src={course.coverImage}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => updateCourse({ coverImage: '' })}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                                                    <ImageIcon size={40} />
                                                    <span className="text-xs mt-2">Sem imagem</span>
                                                </div>
                                            )}
                                        </div>
                                        <ImageUpload
                                            defaultImage={course.coverImage || ''}
                                            onUpload={(url) => updateCourse({ coverImage: url })}
                                            folder="courses/covers"
                                        />
                                        <p className="text-xs text-stone-400 mt-2 text-center">
                                            Recomendado: 1920x1080px
                                        </p>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="bg-white rounded-xl md:rounded-2xl border border-stone-100 p-4 md:p-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 md:mb-4 block">
                                            Estatísticas
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 md:block md:space-y-4">
                                            <div className="flex flex-col md:flex-row items-center md:justify-between text-center md:text-left">
                                                <span className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-stone-600 text-xs md:text-sm">
                                                    <Users size={16} className="text-stone-400" />
                                                    <span className="hidden md:inline">Alunos</span>
                                                </span>
                                                <span className="font-bold text-stone-800 text-lg md:text-base">
                                                    {course.stats?.studentsCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <BookOpen size={16} className="text-stone-400" />
                                                    Aulas
                                                </span>
                                                <span className="font-bold text-stone-800">
                                                    {course.stats?.lessonsCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <Clock size={16} className="text-stone-400" />
                                                    Duração
                                                </span>
                                                <span className="font-bold text-stone-800">
                                                    {course.duration || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Form */}
                                <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
                                    <div className="bg-white rounded-xl md:rounded-2xl border border-stone-100 p-4 md:p-6 space-y-4 md:space-y-6">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                Título do Curso *
                                            </label>
                                            <input
                                                value={course.title || ''}
                                                onChange={e => updateCourse({ title: e.target.value })}
                                                className="w-full text-lg md:text-2xl font-serif font-bold p-3 md:p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                                                placeholder="Ex: Formação em Gestalt-Terapia"
                                            />
                                        </div>

                                        {/* Subtitle */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                Subtítulo
                                            </label>
                                            <input
                                                value={course.subtitle || ''}
                                                onChange={e => updateCourse({ subtitle: e.target.value })}
                                                className="w-full p-3 md:p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm md:text-base"
                                                placeholder="Uma frase de efeito que descreve o curso..."
                                            />
                                        </div>

                                        {/* Grid: Instructor & Category */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                    Instrutor(a)
                                                </label>
                                                <input
                                                    value={course.instructor || ''}
                                                    onChange={e => updateCourse({ instructor: e.target.value })}
                                                    className="w-full p-3 md:p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm md:text-base"
                                                    placeholder="Nome do instrutor"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                    Categoria
                                                </label>
                                                <input
                                                    value={course.category || ''}
                                                    onChange={e => updateCourse({ category: e.target.value })}
                                                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                                                    placeholder="Ex: Gestalt-Terapia"
                                                />
                                            </div>
                                        </div>

                                        {/* Grid: Duration & Level */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                    Duração Total
                                                </label>
                                                <input
                                                    value={course.duration || ''}
                                                    onChange={e => updateCourse({ duration: e.target.value })}
                                                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                                                    placeholder="Ex: 40 horas, 12 semanas"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                    Nível de Dificuldade
                                                </label>
                                                <select
                                                    value={course.level || 'beginner'}
                                                    onChange={e => updateCourse({ level: e.target.value })}
                                                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="beginner">🌱 Iniciante</option>
                                                    <option value="intermediate">🌿 Intermediário</option>
                                                    <option value="advanced">🌳 Avançado</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                                Descrição Completa
                                            </label>
                                            <textarea
                                                value={course.description || ''}
                                                onChange={e => updateCourse({ description: e.target.value })}
                                                rows={6}
                                                className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none resize-none"
                                                placeholder="Descrição detalhada do curso, objetivos de aprendizado, público-alvo, metodologia..."
                                            />
                                            <p className="text-xs text-stone-400">
                                                {(course.description || '').length} caracteres
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tags Section */}
                                    <div className="bg-white rounded-2xl border border-stone-100 p-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 block">
                                            Tags & Palavras-chave
                                        </label>
                                        <p className="text-sm text-stone-500">
                                            Configure tags na aba de Configurações para melhorar a busca.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'curriculum' && <CourseCurriculumTab courseId={course.id} />}
                        {activeTab === 'students' && <CourseStudentsTab courseId={course.id} />}
                        {activeTab === 'materials' && <CourseMaterialsTab courseId={course.id} />}
                        {activeTab === 'announcements' && <CourseAnnouncementsTab courseId={course.id} />}
                        {activeTab === 'community' && <CourseCommunityTab courseId={course.id} />}
                        {activeTab === 'settings' && <CourseSettingsTab course={course} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Save FAB */}
            <div className="fixed bottom-6 right-6 md:hidden">
                <Button
                    onClick={handleSaveCourse}
                    isLoading={isSaving}
                    className="rounded-full w-14 h-14 shadow-2xl"
                >
                    <Save size={24} />
                </Button>
            </div>
        </div>
    );
}
