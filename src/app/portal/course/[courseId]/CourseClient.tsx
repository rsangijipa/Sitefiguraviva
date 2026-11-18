"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ArrowLeft,
  Loader2,
  Lock,
  FileText,
  Download,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  GraduationCap,
  Layout,
  List,
  Bell,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEnrolledCourse } from "@/hooks/useEnrolledCourse";
import { cn } from "@/lib/utils";
import { EnrollmentDoc, CommunityThreadDoc } from "@/types/lms";
import { communityService } from "@/services/communityService";
import { certificateService } from "@/services/certificateService";
import { CertificateDoc } from "@/types/lms";
import { CertificateIssueCard } from "@/components/portal/CertificateIssueCard";
import { CourseGradesPanel } from "@/components/portal/CourseGradesPanel";

const CourseCommunity = dynamic(
  () => import("@/components/community/CourseCommunity"),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-12 text-stone-400">
        Carregando comunidade...
      </div>
    ),
  },
);

const AnnouncementList = dynamic(
  () => import("@/components/community/AnnouncementList"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-center text-xs text-stone-400">
        Carregando avisos...
      </div>
    ),
  },
);

// Separate component to handle search params usage inside Suspense
function CourseContent({ initialData }: { initialData?: any }) {
  const { courseId: routeId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // ID Processing: standardizing param name from page
  const courseId = typeof routeId === "string" ? routeId : "";

  const initialTab = searchParams.get("tab") || "overview";
  // Set by the lesson page when it redirects away from a locked lesson.
  const lockedLessonId = searchParams.get("bloqueada");

  // State
  const {
    data,
    isLoading,
    isAccessDenied: hookDenied,
  } = useEnrolledCourse(courseId, user?.uid, isAdmin, initialData);

  const isAccessDenied = data?.isAccessDenied || hookDenied;
  const status = data?.status || "none";

  const course = data?.course;
  const modules = data?.modules || [];
  const materials = data?.materials || [];
  const enrollment = data?.enrollment as EnrollmentDoc | undefined;
  const allLessons = useMemo(
    () => (data?.modules ?? []).flatMap((m: any) => m.lessons ?? []),
    [data?.modules],
  );

  // Tab State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [threads, setThreads] = useState<CommunityThreadDoc[]>([]);
  const [certificate, setCertificate] = useState<CertificateDoc | null>(null);

  // Check for Certificate
  useEffect(() => {
    if (enrollment?.progressSummary?.percent === 100 && user?.uid) {
      certificateService.getCertificate(user.uid, courseId).then((cert) => {
        if (cert) {
          setCertificate(cert);
        }
      });
    }
  }, [enrollment?.progressSummary?.percent, user?.uid, courseId]);

  // Fetch Threads when tab becomes active
  useEffect(() => {
    if (activeTab === "community" && threads.length === 0) {
      communityService.getCourseThreads(courseId).then(setThreads);
    }
  }, [activeTab, courseId, threads.length]);

  // Handlers
  const handleSelectLesson = (lessonId: string) => {
    router.push(
      `/portal/course/${courseId}/lesson/${encodeURIComponent(lessonId)}`,
    );
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("lesson")) params.delete("lesson"); // Clear lesson if switching tabs manually? Maybe not.
    // Actually if we sort tabs, we are in "Lobby" mode.
    params.set("tab", tab);
    router.replace(`/portal/course/${courseId}?${params.toString()}`, {
      scroll: false,
    });
  };

  const getContinueLessonId = () => {
    const last = enrollment?.progressSummary?.lastLessonId;
    const lastLesson = last
      ? allLessons.find((lesson: any) => lesson.id === last)
      : undefined;
    if (lastLesson && !lastLesson.isLocked) return lastLesson.id;
    // Otherwise the first open lesson still to do, then the first lesson.
    const next = allLessons.find(
      (lesson: any) => !lesson.isLocked && !lesson.isCompleted,
    );
    if (next) return next.id;
    if (allLessons.length > 0) return allLessons[0].id;
    return null;
  };

  const lastLessonId = getContinueLessonId();
  const lockedLesson = lockedLessonId
    ? allLessons.find((lesson: any) => lesson.id === lockedLessonId)
    : undefined;
  const progressPercent = Math.round(enrollment?.progressSummary?.percent || 0);
  const lessonHref = (lessonId: string) =>
    `/portal/course/${courseId}/lesson/${encodeURIComponent(lessonId)}`;
  // A blocked student used to get a button into the lesson, which only
  // redirected back here. Without access, the only action offered is the
  // enrollment form (when there is no enrollment yet).
  const canStudy = !isAccessDenied && !!lastLessonId;
  const studyLabel =
    progressPercent >= 100
      ? "Revisar o curso"
      : enrollment?.progressSummary?.lastLessonId || progressPercent > 0
        ? "Continuar de onde parei"
        : "Começar o curso";
  const enrollHref =
    isAccessDenied && status === "none"
      ? `/inscricao/${encodeURIComponent(courseId)}`
      : null;

  // --- RENDER ---

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  if (!course) return null;

  // View: LOBBY MODE (Tabs)
  return (
    <div className="min-w-0 bg-transparent pb-8">
      {/* Minimal Header */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 min-h-16 flex flex-wrap gap-2 items-center justify-between">
          <Link
            href="/portal/courses"
            className="text-primary hover:bg-emerald-50 flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 px-4 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-800 min-w-0 basis-40 flex-1 break-words">
            {course.title}
          </h1>
          {canStudy && lastLessonId && (
            <Button
              size="sm"
              onClick={() => handleSelectLesson(lastLessonId)}
              leftIcon={<PlayCircle size={14} aria-hidden="true" />}
              className="hidden md:flex ml-4"
              variant="primary"
            >
              {progressPercent >= 100 ? "Revisar" : "Continuar"}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Seções do curso"
          className="max-w-5xl mx-auto p-2 sm:px-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2"
        >
          {[
            { id: "overview", label: "Visão Geral", icon: Layout },
            { id: "modules", label: "Conteúdo", icon: List },
            { id: "materials", label: "Materiais", icon: FileText },
            { id: "grades", label: "Notas", icon: GraduationCap },
            { id: "community", label: "Comunidade", icon: MessageSquare },
          ].map((tab) => (
            <button
              type="button"
              role="tab"
              id={`course-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls="course-tab-panel"
              key={tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onKeyDown={event => {
                const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
                if (!keys.includes(event.key)) return;
                event.preventDefault();
                const tabs = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>("[role=tab]"));
                const index = tabs.indexOf(event.currentTarget);
                const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
                tabs[next].focus();
                tabs[next].click();
              }}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-colors border",
                activeTab === tab.id
                  ? "border-primary bg-primary text-white"
                  : "border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-primary",
              )}
            >
              <tab.icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main
        id="course-tab-panel"
        role="tabpanel"
        aria-labelledby={`course-tab-${activeTab}`}
        className="max-w-5xl mx-auto py-6 min-w-0"
      >
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-8">
              {/* Course Intro */}
              <section>
                {(() => {
                  const cover = (
                    <>
                      {course.coverImage || course.image ? (
                        <Image
                          src={course.coverImage || course.image}
                          alt=""
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <BookOpen size={48} aria-hidden="true" />
                        </div>
                      )}
                      {canStudy && (
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
                          <PlayCircle
                            size={64}
                            aria-hidden="true"
                            className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform"
                          />
                        </div>
                      )}
                    </>
                  );
                  const coverClass =
                    "block aspect-video bg-stone-100 rounded-xl overflow-hidden mb-6 relative group";
                  return canStudy && lastLessonId ? (
                    <Link
                      href={lessonHref(lastLessonId)}
                      aria-label={`${studyLabel}: ${course.title}`}
                      className={cn(
                        coverClass,
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      )}
                    >
                      {cover}
                    </Link>
                  ) : (
                    <div className={coverClass}>{cover}</div>
                  );
                })()}
                <h2 className="text-2xl font-serif text-primary mb-4">
                  Bem-vindo ao Curso
                </h2>
                <div className="prose prose-stone prose-sm max-w-none text-stone-600">
                  {course.description || course.details?.intro}
                </div>
              </section>

              {/* Announcements */}
              <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Bell size={16} /> Avisos Recentes
                </h3>
                <AnnouncementList courseId={courseId} />
              </section>
            </div>

            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="p-6">
                <h3 className="font-bold text-stone-700 mb-4">Seu Progresso</h3>
                {isAccessDenied && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold">
                      {status === "pending_approval"
                        ? "Sua matrícula está em análise."
                        : status === "expired"
                          ? "O período de acesso terminou."
                          : "Este conteúdo ainda não está liberado para você."}
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      {status === "pending_approval"
                        ? "A equipe informará você quando a aprovação for concluída."
                        : "Se você acredita que deveria ter acesso, fale com o suporte."}
                    </p>
                    <Link
                      href="/portal/support"
                      className="mt-2 inline-block text-xs font-bold underline"
                    >
                      Acessar suporte
                    </Link>
                  </div>
                )}
                <div className="mb-2 flex justify-between text-xs font-bold text-stone-500">
                  <span id="course-progress-label">Concluído</span>
                  <span data-testid="course-progress-percent">
                    {progressPercent}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-labelledby="course-progress-label"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  className="h-2 w-full bg-stone-100 rounded-full overflow-hidden mb-4"
                >
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${Math.min(progressPercent, 100)}%`,
                    }}
                  />
                </div>
                {canStudy && lastLessonId && (
                  <Button
                    className="w-full"
                    onClick={() => handleSelectLesson(lastLessonId)}
                    variant="primary"
                  >
                    {studyLabel}
                  </Button>
                )}
                {enrollHref && (
                  <Link
                    href={enrollHref}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-bold text-primary hover:border-igarape hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Lock size={14} aria-hidden="true" />
                    Fazer inscrição
                  </Link>
                )}
              </Card>

              {/* Certificate Status */}
              <CertificateIssueCard
                courseId={courseId}
                courseTitle={course.title}
                progressPercent={enrollment?.progressSummary?.percent || 0}
                isCompleted={enrollment?.status === "completed"} // or calculate from progress
                // Wait, the type of `certificate` state is CertificateDoc.
                // CertificateIssueCard expects { id: string, code: string }
                existingCertificate={
                  certificate
                    ? { id: certificate.id, code: certificate.code }
                    : null
                }
              />
            </div>
          </div>
        )}

        {/* TAB: MODULES */}
        {activeTab === "modules" && (
          <div className="space-y-6 max-w-3xl">
            {lockedLessonId && (
              <div
                role="status"
                className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
              >
                <Lock size={18} className="shrink-0" aria-hidden="true" />
                <p>
                  {lockedLesson?.lockReason
                    ? `A aula “${lockedLesson.title}” ainda não está liberada. ${lockedLesson.lockReason}.`
                    : "Essa aula ainda não está liberada para você."}
                </p>
              </div>
            )}
            {modules.map((module: any) => (
              <div
                key={module.id}
                className="bg-white border border-stone-100 rounded-xl overflow-hidden"
              >
                <div className="p-4 bg-stone-50/50 border-b border-stone-100 font-bold text-stone-700 flex justify-between">
                  {module.title}
                  <span className="text-xs font-normal text-stone-400 px-2 py-0.5 bg-white rounded border border-stone-100">
                    {module.lessons.length} aulas
                  </span>
                </div>
                <ul className="divide-y divide-stone-50">
                  {module.lessons.map((lesson: any) => {
                    const isCurrent = lesson.id === lastLessonId;
                    // Course access denied, or this lesson held back by the
                    // course's release rules (sequence / module date).
                    const blocked = isAccessDenied || !!lesson.isLocked;
                    const row = (
                      <>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-stone-300 border border-stone-100",
                            lesson.isCompleted &&
                              "bg-green-100 text-green-600 border-green-200",
                            isCurrent &&
                              !blocked &&
                              "bg-primary text-white border-primary",
                          )}
                        >
                          {blocked ? (
                            <Lock size={14} />
                          ) : lesson.isCompleted ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <PlayCircle size={14} />
                          )}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium text-stone-600",
                            !blocked && "group-hover:text-primary",
                            isCurrent &&
                              !blocked &&
                              "font-bold text-primary",
                          )}
                        >
                          {lesson.title}
                          {lesson.isCompleted && (
                            <span className="sr-only"> (concluída)</span>
                          )}
                          {isCurrent && !blocked && (
                            <span className="sr-only"> (última aula acessada)</span>
                          )}
                          {!isAccessDenied && lesson.isLocked && lesson.lockReason && (
                            <span className="block text-xs font-normal text-stone-500">
                              {lesson.lockReason}
                            </span>
                          )}
                        </span>
                        {!blocked && (
                          <ArrowRight
                            size={14}
                            aria-hidden="true"
                            className="text-stone-300 group-hover:text-primary"
                          />
                        )}
                      </>
                    );
                    return (
                      <li
                        key={lesson.id}
                        id={`lesson-row-${lesson.id}`}
                        className={cn(
                          lockedLessonId === lesson.id && "bg-amber-50",
                        )}
                      >
                        {blocked ? (
                          <div className="p-4 flex items-center gap-4 text-stone-400">
                            {row}
                          </div>
                        ) : (
                          <Link
                            href={lessonHref(lesson.id)}
                            className="p-4 hover:bg-stone-50 transition-colors flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                          >
                            {row}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB: MATERIALS */}
        {activeTab === "materials" && (
          <div className="space-y-4 max-w-3xl">
            {materials.length > 0 ? (
              materials.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-xl border border-stone-100 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-700 text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-400">
                        Material complementar
                      </p>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${item.title} (nova aba)`}
                    className="p-2 text-stone-400 hover:text-primary transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Download size={20} aria-hidden="true" />
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum material disponível.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: COMMUNITY */}
        {activeTab === "grades" &&
          (isAccessDenied ? (
            <p className="max-w-3xl rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Suas notas ficam disponíveis com a matrícula ativa.
            </p>
          ) : (
            <CourseGradesPanel courseId={courseId} />
          ))}

        {activeTab === "community" && (
          <CourseCommunity courseId={courseId} user={user} />
        )}
      </main>
    </div>
  );
}

export default function CourseClient({ initialData }: { initialData?: any }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
          <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
        </div>
      }
    >
      <CourseContent initialData={initialData} />
    </Suspense>
  );
}
