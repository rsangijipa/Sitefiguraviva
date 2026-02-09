"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { enrollmentService } from "@/services/enrollmentService";
import { progressService } from "@/services/progressService";
import { courseService } from "@/services/courseService";
import { eventService } from "@/services/eventService";
import { certificateService } from "@/services/certificateService";
import {
  Award,
  Play,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  ArrowRight,
} from "@/components/icons";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

const StatCard = ({ icon: Icon, label, value, trend, href }: any) => (
  <Link
    href={href || "#"}
    className={cn(
      "bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between transition-all active:scale-95",
      href ? "hover:border-gold/30 hover:shadow-md cursor-pointer" : "",
    )}
  >
    <div>
      <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
      {trend && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-bold">
          {trend}
        </p>
      )}
    </div>
    <div
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
        href
          ? "bg-gold/5 text-gold group-hover:bg-gold group-hover:text-white"
          : "bg-stone-50 text-stone-400",
      )}
    >
      <Icon size={20} />
    </div>
  </Link>
);

const ActionItem = ({ title, course, type, date, href }: any) => (
  <Link
    href={href || "/portal/events"}
    className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100 group"
  >
    <div
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
        type === "live"
          ? "bg-amber-50 text-amber-600"
          : "bg-blue-50 text-blue-500",
      )}
    >
      {type === "live" ? <Calendar size={20} /> : <Play size={20} />}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-stone-800 truncate group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">
        {course}
      </p>
    </div>
    <div className="text-right shrink-0">
      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
        {date}
      </span>
    </div>
  </Link>
);

export default function PortalDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [lastCourse, setLastCourse] = useState<any>(null);
  const firstName = user?.displayName?.split(" ")[0] || "Aluno";

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) return;
      try {
        // 1. Fetch Enrollments
        const myEnrollments = await enrollmentService.getActiveEnrollments(
          user.uid,
        );

        if (myEnrollments.length > 0) {
          // 2. Fetch Course Data for Valid Enrollments
          const courseIds = myEnrollments.map((e) => e.courseId);
          const coursesData = await courseService.getCoursesByIds(courseIds);

          // Merge data
          const enrichedEnrollments = myEnrollments.map((e) => {
            const course = coursesData.find((c) => c.id === e.courseId);
            return {
              ...e,
              courseTitle: course?.title,
              totalLessons: course?.totalLessons || 0,
            };
          });

          setEnrollments(enrichedEnrollments);

          // 3. Determine Last Accessed (Hero Card)
          // Sort by lastAccessedAt desc
          const sorted = [...enrichedEnrollments].sort((a, b) => {
            const timeA = a.lastAccessedAt?.toMillis
              ? a.lastAccessedAt.toMillis()
              : 0;
            const timeB = b.lastAccessedAt?.toMillis
              ? b.lastAccessedAt.toMillis()
              : 0;
            return timeB - timeA;
          });

          const mostRecent = sorted[0];
          if (mostRecent) {
            const progress = await progressService.getCourseProgress(
              user.uid,
              mostRecent.courseId,
            );
            setLastCourse({
              ...mostRecent,
              lastLessonId: progress?.lastLessonId,
              percent: mostRecent.progressSummary?.percent || 0,
            });
          }
        }

        // 4. Fetch Agenda (Events)
        const upcomingEvents = await eventService.getUpcomingEvents(3);
        setEvents(upcomingEvents);

        // 5. Fetch Certificates
        const myCertificates = await certificateService.getUserCertificates(
          user.uid,
        );
        setCertificates(myCertificates);
      } catch (error) {
        logger.error("Dashboard Load Error", error, { uid: user.uid });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.uid]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-800">
            Olá, {firstName}
          </h1>
          <p className="text-stone-500 mt-1">
            Pronto para continuar sua jornada hoje?
          </p>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-100 text-sm text-stone-500 shadow-sm">
            <Calendar size={16} />
            <span>
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
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
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">
                      Continuar Estudando
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-primary transition-colors">
                    {lastCourse.courseTitle}
                  </h2>
                  <p className="text-sm text-stone-500 mb-4 line-clamp-1">
                    Retome de onde parou.
                  </p>

                  <div className="flex items-center gap-4">
                    <Link
                      href={`/portal/course/${lastCourse.courseId}${lastCourse.lastLessonId ? `/lesson/${lastCourse.lastLessonId}` : ""}`}
                      className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Play size={16} className="fill-current" /> Continuar Aula
                    </Link>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${lastCourse.percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 text-center">
                        {lastCourse.percent}% concluído
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center h-full flex flex-col items-center justify-center">
              <Target size={48} className="text-stone-300 mb-4" />
              <h3 className="text-lg font-bold text-stone-700">
                Comece sua Jornada
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                Você ainda não iniciou nenhum curso. Explore nossa biblioteca.
              </p>
              <Link
                href="/portal/courses"
                className="text-primary font-bold text-sm hover:underline"
              >
                Ver Cursos Disponíveis
              </Link>
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
            href="/portal/courses"
          />
          <StatCard
            icon={Award}
            label="Certificados"
            value={certificates.length}
            trend={certificates.length > 0 ? "Parabéns!" : "Em breve"}
            href="/portal/certificates"
          />
        </div>
      </div>

      {/* Row 2: Journey & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Journey (Visão Macro) */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="font-bold text-stone-800">Minha Jornada</h3>
            </div>
            <Link
              href="/portal/courses"
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver Todos
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.length > 0 ? (
              enrollments.slice(0, 3).map((enr) => (
                <div
                  key={enr.id}
                  className="relative p-4 bg-stone-50/50 rounded-xl border border-stone-100 group transition-all hover:bg-white hover:shadow-md"
                >
                  <Link
                    href={`/portal/course/${enr.courseId}`}
                    className="block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-bold text-stone-700 group-hover:text-primary transition-colors line-clamp-2 pr-4">
                        {enr.courseTitle}
                      </h4>
                      <span className="text-xs font-bold text-primary bg-white px-2 py-1 rounded-lg border border-stone-100 shadow-sm">
                        {enr.progressSummary?.percent || 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{
                          width: `${enr.progressSummary?.percent || 0}%`,
                        }}
                      />
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <p className="text-sm text-stone-400 italic">
                  Nenhum curso iniciado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Certificates / Achievements */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-stone-800">Conquistas Recentes</h3>
            <Link
              href="/portal/certificates"
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver Todos
            </Link>
          </div>

          <div className="flex-1">
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.slice(0, 2).map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/portal/certificates`}
                    className="group p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-gold/30 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Award size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-700 truncate group-hover:text-primary transition-colors">
                        {cert.courseTitle}
                      </h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                        Concluído
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
                <Award size={32} className="text-stone-300 mb-2" />
                <p className="text-xs text-stone-400 italic">
                  Complete seus cursos para ganhar certificados.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Agenda Viva (Live Events) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gold" />
              <h3 className="font-bold text-stone-800">Agenda Viva</h3>
            </div>
            <Link
              href="/portal/events"
              className="text-xs font-bold text-primary hover:underline"
            >
              Full Agenda
            </Link>
          </div>
          <div className="flex-1 space-y-1">
            {events.length > 0 ? (
              events.map((event) => (
                <ActionItem
                  key={event.id}
                  title={event.title}
                  course={
                    event.courseId ? "Mentoria Exclusiva" : "Encontro Aberto"
                  }
                  type="live"
                  date={
                    event.startsAt
                      ? (event.startsAt as any).toDate
                        ? (event.startsAt as any)
                            .toDate()
                            .toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                        : new Date(event.startsAt as any).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                      : "Em breve"
                  }
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <Calendar size={32} className="text-stone-300 mb-2" />
                <p className="text-xs text-stone-400 italic">
                  Nenhum evento agendado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
