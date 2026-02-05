
"use client";

import { useAuth } from "@/context/AuthContext";
import { Play, TrendingUp, Clock, Target, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { enrollmentService } from "@/services/enrollmentService";
import { progressService } from "@/services/progressService";
import { courseService } from "@/services/courseService";
import { eventService } from "@/services/eventService";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useRouter } from "next/navigation";

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
            {trend && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> {trend}</p>}
        </div>
        <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400">
            <Icon size={20} />
        </div>
    </div>
);

const ActionItem = ({ title, course, type, date }: any) => (
    <div className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer group">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            type === 'exam' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
        )}>
            {type === 'exam' ? <Clock size={18} /> : <Play size={18} />}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-stone-800 truncate group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-stone-400 truncate">{course}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold text-stone-400">{date}</span>
        </div>
    </div>
);


export default function PortalDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [lastCourse, setLastCourse] = useState<any>(null);
    const firstName = user?.displayName?.split(" ")[0] || "Aluno";

    useEffect(() => {
        async function loadDashboard() {
            if (!user?.uid) return;
            try {
                // 1. Fetch Enrollments
                const myEnrollments = await enrollmentService.getActiveEnrollments(user.uid);

                if (myEnrollments.length > 0) {
                    // 2. Fetch Course Data for Valid Enrollments
                    const courseIds = myEnrollments.map(e => e.courseId);
                    const coursesData = await courseService.getCoursesByIds(courseIds);

                    // Merge data
                    const enrichedEnrollments = myEnrollments.map(e => {
                        const course = coursesData.find(c => c.id === e.courseId);
                        return { ...e, courseTitle: course?.title, totalLessons: course?.totalLessons || 0 };
                    });

                    setEnrollments(enrichedEnrollments);

                    // 3. Determine Last Accessed (Hero Card)
                    // Sort by lastAccessedAt desc
                    const sorted = [...enrichedEnrollments].sort((a, b) => {
                        const timeA = a.lastAccessedAt?.toMillis ? a.lastAccessedAt.toMillis() : 0;
                        const timeB = b.lastAccessedAt?.toMillis ? b.lastAccessedAt.toMillis() : 0;
                        return timeB - timeA;
                    });

                    const mostRecent = sorted[0];
                    if (mostRecent) {
                        const progress = await progressService.getCourseProgress(user.uid, mostRecent.courseId);
                        setLastCourse({
                            ...mostRecent,
                            lastLessonId: progress?.lastLessonId,
                            percent: mostRecent.progressSummary?.percent || 0
                        });
                    }
                }

                // 4. Fetch Agenda (Events)
                const upcomingEvents = await eventService.getUpcomingEvents(3);
                setEvents(upcomingEvents);
            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, [user?.uid]);

    if (loading) return <Loading />; // Use the loading skeleton we made

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-stone-800">Olá, {firstName}</h1>
                    <p className="text-stone-500 mt-1">Pronto para continuar sua jornada hoje?</p>
                </div>
                <div className="flex gap-2">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-100 text-sm text-stone-500 shadow-sm">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Hero Card: Resume (Col-8) */}
                <div className="lg:col-span-8">
                    {lastCourse ? (
                        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-lg relative overflow-hidden group h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="w-full md:w-48 aspect-video bg-stone-900 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                                    <Play size={32} className="text-white fill-white" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">Continuar Estudando</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-primary transition-colors">{lastCourse.courseTitle}</h2>
                                    <p className="text-sm text-stone-500 mb-4 line-clamp-1">Retome de onde parou.</p>

                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/portal/course/${lastCourse.courseId}${lastCourse.lastLessonId ? `/lesson/${lastCourse.lastLessonId}` : ''}`}
                                            className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2 text-sm"
                                        >
                                            <Play size={16} className="fill-current" /> Continuar Aula
                                        </Link>
                                        <div className="flex-1 max-w-[120px]">
                                            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${lastCourse.percent}%` }} />
                                            </div>
                                            <p className="text-[10px] text-stone-400 mt-1 text-center">{lastCourse.percent}% concluído</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center h-full flex flex-col items-center justify-center">
                            <Target size={48} className="text-stone-300 mb-4" />
                            <h3 className="text-lg font-bold text-stone-700">Comece sua Jornada</h3>
                            <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">Você ainda não iniciou nenhum curso. Explore nossa biblioteca.</p>
                            <Link href="/portal/courses" className="text-primary font-bold text-sm hover:underline">Ver Cursos Disponíveis</Link>
                        </div>
                    )}
                </div>

                {/* KPI Cards (Col-4) */}
                <div className="lg:col-span-4 space-y-4">
                    <StatCard
                        icon={Target}
                        label="Cursos Ativos"
                        value={enrollments.length}
                        trend="Mantenha o foco!"
                    />
                    <StatCard
                        icon={Clock}
                        label="Certificados"
                        value="0" // TODO: Fetch Certificates Count
                        trend="Em breve"
                    />
                </div>
            </div>

            {/* Row 2: Journey & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* My Journey (Visão Macro) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-stone-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800">Minha Jornada</h3>
                        <Link href="/portal/courses" className="text-xs font-bold text-primary hover:underline">Ver Todos</Link>
                    </div>

                    <div className="space-y-6">
                        {enrollments.length > 0 ? enrollments.slice(0, 3).map((enr) => (
                            <div key={enr.id} className="flex items-center gap-4">
                                <Link href={`/portal/course/${enr.courseId}`} className="flex-1 group">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="text-sm font-bold text-stone-700 group-hover:text-primary transition-colors">{enr.courseTitle}</h4>
                                        <span className="text-xs font-bold text-stone-400">{enr.progressSummary?.percent || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-300 w-0 transition-all duration-500" style={{ width: `${enr.progressSummary?.percent || 0}%` }} />
                                    </div>
                                </Link>
                            </div>
                        )) : (
                            <p className="text-sm text-stone-400 italic">Nenhum curso iniciado.</p>
                        )}
                    </div>
                </div>

                {/* Next Actions */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-stone-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800">Próximas Ações</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="space-y-2">
                            {events.length > 0 ? (
                                events.map(event => (
                                    <ActionItem
                                        key={event.id}
                                        title={event.title}
                                        course={event.courseId ? "Curso Exclusivo" : "Evento Ao Vivo"} // We could lookup course title if map available
                                        type={event.meetingUrl ? "live" : "exam"} // Simple heuristic
                                        date={event.startsAt ? ((event.startsAt as any).toDate ? (event.startsAt as any).toDate() : new Date(event.startsAt as any)).toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'A definir'}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-stone-400 italic p-2">Nenhum evento agendado.</p>
                            )}
                            {/* TODO: Add dynamic "Next Lesson" suggestions based on progress */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
