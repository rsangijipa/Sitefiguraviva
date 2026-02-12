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
  Target,
  Calendar,
  AlertTriangle,
  RefreshCcw,
} from "@/components/icons";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { logger } from "@/lib/logger";
import { EmptyState } from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

const StatCard = ({ icon: Icon, label, value, trend, href }: any) => (
  <Link
    href={href || "#"}
    className={cn(
      "bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between transition-all active:scale-95 group",
      href ? "hover:border-agedGold/30 hover:shadow-md cursor-pointer" : "",
    )}
  >
    <div>
      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
      {trend && (
        <p className="text-[10px] text-agedGold mt-1 flex items-center gap-1 font-bold uppercase tracking-wide">
          {trend}
        </p>
      )}
    </div>
    <div
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
        href
          ? "bg-agedGold/5 text-agedGold group-hover:bg-agedGold group-hover:text-ink"
          : "bg-stone-50 text-stone-300",
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
          ? "bg-agedGold/10 text-agedGold"
          : "bg-stone-100 text-ink",
      )}
    >
      {type === "live" ? <Calendar size={20} /> : <Play size={20} />}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-ink truncate group-hover:text-agedGold transition-colors">
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
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [lastCourse, setLastCourse] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<number | null>(
    null,
  );
  const [reloadNonce, setReloadNonce] = useState(0);
  const firstName = user?.displayName?.split(" ")[0] || "Aluno";

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) {
        setLoading(false);
        setLoadError("Sua sessão não foi encontrada. Faça login novamente.");
        return;
      }

      setLoading(true);
      setLoadError(null);
      setEnrollments([]);
      setEvents([]);
      setCertificates([]);
      setLastCourse(null);

      try {
        // Parallel fetch for initial data to improve performance
        const [myEnrollments, upcomingEvents, myCertificates] =
          await Promise.allSettled([
            enrollmentService.getActiveEnrollments(user.uid),
            eventService.getUpcomingEvents(3),
            certificateService.getUserCertificates(user.uid),
          ]);

        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const pct = Number(userSnap.data()?.profileCompletion || 0);
            setProfileCompletion(Number.isFinite(pct) ? pct : 0);
          } else {
            setProfileCompletion(0);
          }
        } catch (profileError) {
          logger.warn("Profile completion read failed", {
            profileError,
            uid: user.uid,
          });
          setProfileCompletion(null);
        }

        if (upcomingEvents.status === "fulfilled") {
          setEvents(upcomingEvents.value);
        }
        if (myCertificates.status === "fulfilled") {
          setCertificates(myCertificates.value);
        }

        if (myEnrollments.status !== "fulfilled") {
          setLoadError(
            "Não foi possível carregar suas matrículas agora. Tente atualizar.",
          );
          return;
        }

        if (myEnrollments.value.length > 0) {
          const enrollmentData = myEnrollments.value;
          // 2. Fetch Course Data for Valid Enrollments
          const courseIds = enrollmentData.map((e) => e.courseId);

          try {
            const coursesData = await courseService.getCoursesByIds(courseIds);

            // Merge data
            const enrichedEnrollments = enrollmentData.map((e) => {
              const course = coursesData.find((c) => c.id === e.courseId);
              return {
                ...e,
                courseTitle: course?.title,
                totalLessons: course?.totalLessons || 0,
              };
            });

            setEnrollments(enrichedEnrollments);

            // 3. Determine Last Accessed (Hero Card)
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
              setLastCourse({
                ...mostRecent,
                lastLessonId: mostRecent.lastLessonId,
                percent: mostRecent.progressSummary?.percent || 0,
              });
            }
          } catch (courseError) {
            logger.error("Course Data Load Error", courseError, {
              uid: user.uid,
            });

            setEnrollments(enrollmentData);
            setLoadError(
              "Carregamos suas matrículas, mas parte dos detalhes do curso pode estar indisponível no momento.",
            );
          }
        }
      } catch (error) {
        logger.error("Dashboard Load Error", error, { uid: user.uid });
        setLoadError(
          "Não foi possível carregar o painel agora. Verifique sua conexão e tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.uid, reloadNonce]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-ink tracking-tight">
            Olá, {firstName}
          </h1>
          <p className="text-stone-500 mt-2 font-serif italic">
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

      {loadError && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2 text-amber-800">
            <AlertTriangle size={18} className="mt-0.5" />
            <p className="text-sm">{loadError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            leftIcon={<RefreshCcw size={14} />}
            onClick={() => setReloadNonce((v) => v + 1)}
          >
            Atualizar painel
          </Button>
        </div>
      )}

      {profileCompletion !== null && profileCompletion < 100 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Complete seu cadastro para melhorar sua experiência
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Seu perfil está em {profileCompletion}%. Isso ajuda o time
              pedagógico a personalizar seu acompanhamento.
            </p>
          </div>
          <Link href="/portal/settings">
            <Button
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              Completar Cadastro
            </Button>
          </Link>
        </div>
      )}

      {/* Row 1: Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero Card: Resume (Col-8) */}
        <div className="lg:col-span-8">
          {lastCourse ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-lg relative overflow-hidden group h-full flex flex-col justify-center transition-all hover:border-agedGold/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-agedGold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-full md:w-48 aspect-video bg-ink rounded-lg flex items-center justify-center shrink-0 shadow-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Play size={32} className="text-agedGold relative z-10" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-agedGold/10 text-agedGold text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm border border-agedGold/10">
                      Continuar Estudando
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif text-ink mb-2 group-hover:text-agedGold transition-colors tracking-tight">
                    {lastCourse.courseTitle}
                  </h2>
                  <p className="text-sm text-stone-500 mb-6 font-serif italic">
                    Retome sua última lição e avance no seu processo.
                  </p>

                  <div className="flex items-center gap-6">
                    <Link
                      href={`/portal/course/${lastCourse.courseId}${lastCourse.lastLessonId ? `/lesson/${lastCourse.lastLessonId}` : ""}`}
                      className="bg-ink text-agedGold hover:bg-agedGold hover:text-ink px-8 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                      <Play size={14} className="fill-current" /> Continuar Aula
                    </Link>
                    <div className="flex-1 max-w-[140px]">
                      <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-agedGold transition-all duration-1000"
                          style={{ width: `${lastCourse.percent}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-2">
                        {lastCourse.percent}% concluído
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Target size={32} />}
              title="Comece sua Jornada"
              description="Você ainda não iniciou nenhum curso. Explore nossa biblioteca de formações."
              action={
                <Link href="/portal/courses">
                  <Button variant="primary">Ver Cursos</Button>
                </Link>
              }
              className="h-full py-12"
            />
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

          {/* Activity Chart */}
          <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
                Atividade Semanal
              </h3>
            </div>
            {/* Mock Data for now - waiting for backend aggregation */}
            <div className="flex items-end justify-between h-32 gap-2">
              {[30, 45, 20, 60, 40, 80, 50].map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-stone-50 rounded-t-md hover:bg-agedGold/20 transition-colors relative group"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-ink text-agedGold text-[10px] px-2 py-1 rounded pointer-events-none transition-opacity font-bold">
                    {val * 10} XP
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
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
                  className="relative p-4 bg-stone-50/50 rounded-xl border border-stone-100 group transition-all hover:bg-white hover:border-agedGold/30 hover:shadow-md"
                >
                  <Link
                    href={`/portal/course/${enr.courseId}`}
                    className="block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-bold text-ink group-hover:text-agedGold transition-colors line-clamp-2 pr-4 font-serif">
                        {enr.courseTitle}
                      </h4>
                      <span className="text-[10px] font-bold text-agedGold bg-white px-2 py-1 rounded-lg border border-stone-100 shadow-sm uppercase tracking-tighter">
                        {enr.progressSummary?.percent || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-agedGold transition-all duration-1000"
                        style={{
                          width: `${enr.progressSummary?.percent || 0}%`,
                        }}
                      />
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center bg-stone-50/50 rounded-xl border border-stone-100">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  Nenhum curso iniciado no momento
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
                    className="group p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-agedGold/30 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-agedGold/10 rounded-full flex items-center justify-center text-agedGold shrink-0 group-hover:scale-110 transition-transform">
                      <Award size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ink truncate group-hover:text-agedGold transition-colors font-serif">
                        {cert.courseTitle}
                      </h4>
                      <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">
                        Concluído
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-stone-50/50 rounded-xl border border-stone-100 h-full">
                <Award size={24} className="text-stone-300 mb-2 opacity-50" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  Nenhum certificado ainda
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
              Ver agenda
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
              <div className="flex flex-col items-center justify-center py-10 bg-stone-50/50 rounded-xl border border-stone-100 h-full">
                <Calendar
                  size={24}
                  className="text-stone-300 mb-2 opacity-50"
                />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  Nenhum evento agendado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
