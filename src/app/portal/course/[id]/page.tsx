"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Calendar, ArrowLeft, Loader2, Lock, FileText, Download, PlayCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CoursePlayer } from '@/components/portal/CoursePlayer';
import { Module, Lesson } from '@/components/portal/LessonSidebar';
import { useEnrolledCourse } from '@/hooks/useEnrolledCourse';

// Separate component to handle search params usage inside Suspense
function CourseContent() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // ID Processing
    const courseId = typeof id === 'string' ? id : '';
    const initialLessonId = searchParams.get('lesson');

    // State
    const {
        data,
        isLoading,
        isAccessDenied,
        updateLastAccess,
        markComplete
    } = useEnrolledCourse(courseId, user?.uid);

    const course = data?.course;
    const modules = data?.modules || [];
    const materials = data?.materials || [];
    const enrollment = data?.enrollment;

    // Player State
    const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId);

    // Update active lesson if URL changes (back/forward navigation)
    useEffect(() => {
        if (initialLessonId !== undefined) {
            setActiveLessonId(initialLessonId);
        }
    }, [initialLessonId]);

    // Handlers
    const handleSelectLesson = (lessonId: string) => {
        setActiveLessonId(lessonId);

        // Update URL without reload to support sharing/bookmarks
        const params = new URLSearchParams(searchParams.toString());
        params.set('lesson', lessonId);
        router.push(`/portal/course/${courseId}?${params.toString()}`, { scroll: false });

        // Update Firebase via Mutation
        updateLastAccess(lessonId);
    };

    const handleMarkComplete = (lessonId: string) => {
        markComplete(lessonId);
    };

    const getContinueLessonId = () => {
        if (enrollment?.lastLessonId) return enrollment.lastLessonId;
        if (modules.length > 0 && modules[0].lessons.length > 0) return modules[0].lessons[0].id;
        return null;
    };

    // --- RENDER ---

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        );
    }

    // --- SUBSCRIPTION HANDLERS ---
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const { user: authUser } = useAuth(); // Need auth for headers (handled by cookie ideally but efficient enough to pass if we used client interaction)
    // Actually our API checks ID Token from header. We need to get it.

    // Helper to get token
    const getToken = async () => authUser?.getIdToken();

    const handleSubscribe = async () => {
        try {
            setCheckoutLoading(true);
            const token = await getToken();
            const res = await fetch('/api/billing/checkout-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao iniciar checkout');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePortal = async () => {
        try {
            setCheckoutLoading(true);
            const token = await getToken();
            const res = await fetch('/api/billing/customer-portal', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao abrir portal');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const status = data?.status || 'none';

    // PAYWALL / STATUS HANDLING
    if (status !== 'active' && !isLoading) {
        // If Status is 'none' (Not enrolled) -> Paywall
        // If Status is 'past_due' -> Regularize
        // If Status is 'pending' -> Wait
        // If Status is 'canceled' -> Resubscribe

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9] text-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-primary/5 z-0" />
                <div className="relative z-10 max-w-lg w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-stone-100">

                    {/* Icon based on status */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm ${status === 'past_due' ? 'bg-red-50 text-red-500' :
                        status === 'pending' ? 'bg-yellow-50 text-yellow-500' :
                            'bg-gold/10 text-gold'
                        }`}>
                        {status === 'past_due' ? <Lock size={32} /> :
                            status === 'pending' ? <Loader2 size={32} className="animate-spin" /> :
                                <Lock size={32} />}
                    </div>

                    <h1 className="font-serif text-3xl text-primary mb-4 leading-tight">
                        {status === 'pending' ? 'Matrícula em Processamento' :
                            status === 'past_due' ? 'Pagamento Pendente' :
                                status === 'canceled' ? 'Assinatura Cancelada' :
                                    course?.title || 'Conteúdo Exclusivo'}
                    </h1>

                    <p className="text-stone-500 mb-8 leading-relaxed">
                        {status === 'pending' ? 'Aguarde alguns instantes enquanto confirmamos seu pagamento. Você pode atualizar a página.' :
                            status === 'past_due' ? 'Houve um problema com seu último pagamento. Atualize seus dados para recuperar o acesso.' :
                                status === 'canceled' ? 'Sua assinatura foi cancelada. Reative para continuar seus estudos.' :
                                    'Para acessar este curso completo, aulas e materiais, torne-se um assinante.'}
                    </p>

                    <div className="space-y-4">
                        {status === 'none' || status === 'canceled' ? (
                            <Button
                                onClick={handleSubscribe}
                                isLoading={checkoutLoading}
                                rightIcon={<ArrowRight size={18} />}
                                className="w-full justify-center py-4 text-base"
                            >
                                Assinar Mensalmente
                            </Button>
                        ) : status === 'past_due' ? (
                            <Button
                                onClick={handlePortal}
                                isLoading={checkoutLoading}
                                className="w-full justify-center py-4 text-base bg-red-500 hover:bg-red-600 border-none text-white"
                            >
                                Regularizar Pagamento
                            </Button>
                        ) : status === 'pending' ? (
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="w-full justify-center"
                            >
                                Atualizar Página
                            </Button>
                        ) : null}

                        <Link href="/portal" className="block">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
                                Voltar para Meus Cursos
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) return null;

    // View: PLAYER MODE
    if (activeLessonId) {
        const activeLesson = modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId) || null;

        // Find next/prev for navigation
        const allLessons = modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === activeLessonId);
        const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : undefined;
        const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : undefined;

        // If lesson ID in URL is invalid, fallback gracefully
        if (!activeLesson && modules.length > 0 && !loading) {
            // If data is loaded but lesson not found, it might be a bad ID. 
            // We can show the course info instead or a "Lesson not found" state.
            // For now, let's keep rendering to avoid layout shift, but CoursePlayer might handle null activeLesson.
            // Actually CoursePlayer handles activeLesson={null} by showing "Select a lesson".
        }

        return (
            <CoursePlayer
                course={{ id: course.id, title: course.title, backLink: `/portal/course/${course.id}` }} // Back link clears query param
                modules={modules}
                activeLesson={activeLesson}
                onSelectLesson={handleSelectLesson}
                onMarkComplete={handleMarkComplete}
                prevLessonId={prevLessonId}
                nextLessonId={nextLessonId}
            />
        );
    }

    // View: COURSE INFO (Welcome Page)
    const continueLessonId = getContinueLessonId();

    return (
        <div className="min-h-screen bg-[#FDFCF9] pb-20">
            {/* Hero */}
            <header className="bg-white border-b border-stone-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/95 mix-blend-multiply z-10" />
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />

                <div className="relative z-20 max-w-5xl mx-auto px-6 py-20 text-white">
                    <Link href="/portal" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-[10px] font-bold uppercase tracking-widest">
                        <ArrowLeft size={14} /> Voltar
                    </Link>
                    <h1 className="font-serif text-4xl md:text-6xl mb-4 leading-tight">{course.title}</h1>
                    <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl leading-relaxed">{course.subtitle || course.description}</p>

                    <div className="flex flex-wrap gap-6 mt-12 text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {enrollment && <span className="px-3 py-1 bg-white/10 rounded-full text-white border border-white/20">Matrícula Ativa</span>}
                        <span className="flex items-center gap-2"><Calendar size={14} /> {course.date}</span>
                    </div>

                    <div className="mt-12">
                        {modules.length > 0 ? (
                            <Button
                                onClick={() => continueLessonId && handleSelectLesson(continueLessonId)}
                                variant="primary"
                                className="bg-white text-primary hover:bg-stone-100 border-none px-8 py-4 h-auto text-sm"
                                rightIcon={<PlayCircle size={20} />}
                            >
                                {enrollment?.lastLessonId ? 'Continuar de Onde Parei' : 'Começar Aula'}
                            </Button>
                        ) : (
                            <Button disabled variant="outline" className="text-white border-white/30">Em Breve</Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    {/* Modules List (Preview) */}
                    <section>
                        <h3 className="font-serif text-2xl text-primary mb-6">Conteúdo do Curso</h3>
                        <div className="space-y-4">
                            {modules.map((module, idx) => (
                                <div key={module.id} className="bg-white border border-stone-100 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                                        <h4 className="font-bold text-primary">{module.title}</h4>
                                        <span className="text-[10px] uppercase font-bold text-stone-400">{module.lessons.length} Aulas</span>
                                    </div>
                                    <div className="divide-y divide-stone-50">
                                        {module.lessons.map(lesson => (
                                            <div
                                                key={lesson.id}
                                                onClick={() => !lesson.isLocked && handleSelectLesson(lesson.id)}
                                                className={`p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group ${lesson.isLocked ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${lesson.isCompleted ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-300 group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                                                    {lesson.isCompleted ? <FileText size={14} /> : <PlayCircle size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-stone-700 group-hover:text-primary transition-colors">{lesson.title}</h5>
                                                    {lesson.duration && <p className="text-xs text-stone-400">{lesson.duration}</p>}
                                                </div>
                                                {lesson.isLocked && <Lock size={14} className="text-stone-300" />}
                                                {lesson.id === enrollment?.lastLessonId && (
                                                    <div className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded font-bold uppercase">Continuar</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {modules.length === 0 && (
                                <p className="text-stone-400 italic">Nenhum módulo disponível ainda.</p>
                            )}
                        </div>
                    </section>

                    {/* Introduction */}
                    <section>
                        <h3 className="font-serif text-2xl text-primary mb-6">Sobre o Curso</h3>
                        <div className="prose prose-stone prose-sm max-w-none text-stone-600 leading-relaxed font-light">
                            {course.details?.intro?.split('\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
                        </div>
                    </section>

                    {/* Materials Section */}
                    {materials.length > 0 && (
                        <section>
                            <h3 className="font-serif text-2xl text-primary mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm"><FileText size={16} /></span>
                                Materiais Complementares
                            </h3>

                            <div className="space-y-4">
                                {materials.map(item => (
                                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary group-hover:text-gold transition-colors">{item.title}</h4>
                                                <p className="text-xs text-stone-400">{item.file_type?.toUpperCase() || 'PDF'} • {item.file_size || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={item.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
                                            download
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm sticky top-24">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-primary/40 mb-6">Informações</h4>

                        {course.details?.format && (
                            <div className="mb-6">
                                <h5 className="font-bold text-primary text-sm mb-2">Formato</h5>
                                <p className="text-sm text-stone-500 whitespace-pre-line leading-relaxed">{course.details.format}</p>
                            </div>
                        )}

                        {course.details?.schedule && (
                            <div>
                                <h5 className="font-bold text-primary text-sm mb-2">Cronograma</h5>
                                <p className="text-sm text-stone-500 whitespace-pre-line leading-relaxed">{course.details.schedule}</p>
                            </div>
                        )}

                        {course.link && (
                            <div className="mt-8 pt-6 border-t border-stone-100">
                                <a
                                    href={course.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full text-center bg-stone-50 text-stone-500 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors"
                                >
                                    Link Externo
                                </a>
                            </div>
                        )}
                    </div>
                </aside>

            </main>
        </div>
    );
}

export default function CoursePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        }>
            <CourseContent />
        </Suspense>
    );
}
