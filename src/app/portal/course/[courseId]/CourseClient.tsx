"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
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
  MessageSquare,
  Layout,
  List,
  Bell,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LessonPlayer } from "@/components/lms/LessonPlayer";
import { useEnrolledCourse } from "@/hooks/useEnrolledCourse";
import { cn } from "@/lib/utils";
import { EnrollmentDoc, CommunityThreadDoc } from "@/types/lms";
import { communityService } from "@/services/communityService";
import CourseCommunity from "@/components/community/CourseCommunity";
import AnnouncementList from "@/components/community/AnnouncementList";
import { certificateService } from "@/services/certificateService";
import { CertificateDoc } from "@/types/lms";
import { CertificateIssueCard } from "@/components/portal/CertificateIssueCard";

// Separate component to handle search params usage inside Suspense
function CourseContent({ initialData }: { initialData?: any }) {
  const { courseId: routeId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // ID Processing: standardizing param name from page
  const courseId = typeof routeId === "string" ? routeId : "";
  const initialLessonId = searchParams.get("lesson");
  const initialTab = searchParams.get("tab") || "overview";

  // State
  const { data, isLoading, isAccessDenied, updateLastAccess, markComplete } =
    useEnrolledCourse(courseId, user?.uid, isAdmin, initialData);

  const status = data?.status || "none";
  const isAuthorized = isAdmin || status === "active" || status === "completed";

  const course = data?.course;
  const modules = data?.modules || [];
  const materials = data?.materials || [];
  const enrollment = data?.enrollment as EnrollmentDoc | undefined;

  // Player State
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    initialLessonId,
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

  // Update active lesson if URL changes (back/forward navigation)
  useEffect(() => {
    if (initialLessonId !== null && initialLessonId !== undefined) {
      setActiveLessonId(initialLessonId);
    } else {
      setActiveLessonId(null);
    }
  }, [initialLessonId]);

  // Handlers
  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("lesson", lessonId);
    router.push(`/portal/course/${courseId}?${params.toString()}`, {
      scroll: false,
    });
    updateLastAccess(lessonId);
  };

  const handleMarkComplete = (lessonId: string, moduleId?: string) => {
    // If moduleId provided (by LessonPlayer), use it
    if (moduleId) {
      markComplete(lessonId, moduleId);
      return;
    }

    // Fallback: Find it in modules
    const module = modules.find((m) =>
      m.lessons.some((l) => l.id === lessonId),
    );
    if (module) {
      markComplete(lessonId, module.id);
    } else {
      console.error("Could not find module for lesson", lessonId);
    }
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
    if (enrollment?.progressSummary?.lastLessonId)
      return enrollment.progressSummary.lastLessonId;
    if (modules.length > 0 && modules[0].lessons.length > 0)
      return modules[0].lessons[0].id;
    return null;
  };

  const lastLessonId = getContinueLessonId();

  // --- RENDER ---

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  // Access Denied / Paywall (Ideally handled by server, but fail-safe here)
  if (isAccessDenied || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <Lock size={48} className="text-stone-300 mb-4" />
        <h1 className="text-2xl font-bold text-stone-700">Acesso Restrito</h1>
        <p className="text-stone-500 mb-6">
          Você não tem permissão para acessar este conteúdo.
        </p>
        <Link href="/portal">
          <Button>Voltar para o Portal</Button>
        </Link>
      </div>
    );
  }

  if (!course) return null;

  // View: PLAYER MODE
  if (activeLessonId) {
    const activeLesson =
      modules.flatMap((m) => m.lessons).find((l) => l.id === activeLessonId) ||
      null;

    // Navigation Logic
    const allLessons = modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLessonId);
    const prevLessonId =
      currentIndex > 0 ? allLessons[currentIndex - 1].id : undefined;
    const nextLessonId =
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1].id
        : undefined;

    if (!activeLesson && modules.length > 0) {
      // Fallback or Loading
    }

    return (
      <LessonPlayer
        course={{
          id: course.id,
          title: course.title,
          backLink: `/portal/course/${course.id}`,
        }}
        modules={modules}
        activeLesson={activeLesson}
        onSelectLesson={handleSelectLesson}
        onMarkComplete={handleMarkComplete}
        prevLessonId={prevLessonId}
        nextLessonId={nextLessonId}
      />
    );
  }

  // View: LOBBY MODE (Tabs)
  return (
    <div className="min-h-screen bg-[#FDFCF9] pb-20 animate-fade-in">
      {/* Minimal Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link
            href="/portal"
            className="text-stone-400 hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="font-serif font-bold text-stone-800 truncate pl-4 flex-1 text-center md:text-left">
            {course.title}
          </h1>
          {lastLessonId && (
            <Button
              size="sm"
              onClick={() => handleSelectLesson(lastLessonId)}
              leftIcon={<PlayCircle size={14} />}
              className="hidden md:flex ml-4"
            >
              Continuar
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Visão Geral", icon: Layout },
            { id: "modules", label: "Conteúdo", icon: List },
            { id: "materials", label: "Materiais", icon: FileText },
            { id: "community", label: "Comunidade", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 pb-3 mb-[-1px] text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-stone-500 hover:text-stone-800",
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Course Intro */}
              <section>
                <div
                  className="aspect-video bg-stone-100 rounded-xl overflow-hidden mb-6 relative group cursor-pointer"
                  onClick={() =>
                    lastLessonId && handleSelectLesson(lastLessonId)
                  }
                >
                  {course.coverImage || course.image ? (
                    <Image
                      src={course.coverImage || course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle
                      size={64}
                      className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform"
                    />
                  </div>
                </div>
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
                <div className="mb-2 flex justify-between text-xs font-bold text-stone-500">
                  <span>Concluído</span>
                  <span>
                    {Math.round(enrollment?.progressSummary?.percent || 0)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${enrollment?.progressSummary?.percent || 0}%`,
                    }}
                  />
                </div>
                {lastLessonId && (
                  <Button
                    className="w-full"
                    onClick={() => handleSelectLesson(lastLessonId)}
                  >
                    Continuar Estudando
                  </Button>
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
                <div className="divide-y divide-stone-50">
                  {module.lessons.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson.id)}
                      className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-4 group"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-stone-300 border border-stone-100",
                          lesson.isCompleted &&
                            "bg-green-100 text-green-600 border-green-200",
                          lesson.id === lastLessonId &&
                            "bg-primary text-white border-primary",
                        )}
                      >
                        {lesson.isCompleted ? (
                          <ArrowRight size={14} />
                        ) : (
                          <PlayCircle size={14} />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium text-stone-600 group-hover:text-primary",
                          lesson.id === lastLessonId &&
                            "font-bold text-primary",
                        )}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                </div>
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
                    className="p-2 text-stone-300 hover:text-primary transition-colors"
                  >
                    <Download size={20} />
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
