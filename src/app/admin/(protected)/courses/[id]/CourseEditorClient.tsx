"use client";

import { useState, useEffect } from "react";
import { CourseDoc } from "@/types/lms";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Layout,
  List,
  Users,
  MessageSquare,
  Settings,
  FileText,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  BookOpen,
  GraduationCap,
  BarChart3,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  Bell,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";
import { useToast } from "@/context/ToastContext";
import { adminCourseService } from "@/services/adminCourseService";
import { motion, AnimatePresence } from "framer-motion";
import CourseCurriculumTab from "./tabs/CourseCurriculumTab";
import CourseStudentsTab from "./tabs/CourseStudentsTab";
import CourseCommunityTab from "./tabs/CourseCommunityTab";
import CourseAnnouncementsTab from "./tabs/CourseAnnouncementsTab";
import CourseMaterialsTab from "./tabs/CourseMaterialsTab";
import CourseSettingsTab from "./tabs/CourseSettingsTab";
import { toggleCourseStatus } from "@/app/actions/admin-publishing";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";

const TABS = [
  {
    id: "info",
    label: "Informações",
    icon: Layout,
    description: "Dados básicos do curso",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: List,
    description: "Módulos e aulas",
  },
  {
    id: "students",
    label: "Alunos",
    icon: Users,
    description: "Matrículas e progresso",
  },
  {
    id: "materials",
    label: "Materiais",
    icon: FileText,
    description: "Downloads e recursos",
  },
  {
    id: "announcements",
    label: "Avisos",
    icon: Bell,
    description: "Comunicados",
  },
  {
    id: "community",
    label: "Comunidade",
    icon: MessageSquare,
    description: "Fórum e discussões",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    description: "Avançado",
  },
];

export default function CourseEditorClient({
  initialCourse,
}: {
  initialCourse: CourseDoc;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [course, setCourse] = useState<CourseDoc>(initialCourse);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Tab State with URL sync
  const initialTab = searchParams.get("tab") || "info";
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/courses/${course.id}?${params.toString()}`, {
      scroll: false,
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Track changes
  const updateCourse = (updates: Partial<CourseDoc>) => {
    setCourse((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      await adminCourseService.updateCourse(course.id, course);
      addToast("Curso salvo com sucesso!", "success");
      setHasUnsavedChanges(false);
    } catch (error) {
      addToast("Erro ao salvar", "error");
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
        setCourse({
          ...course,
          status: result.newStatus,
          isPublished: result.isPublished,
        });
        addToast(
          result.newStatus === "open"
            ? "🎉 Curso Publicado!"
            : "Curso despublicado",
          "success",
        );
      } else {
        addToast("Erro: " + result.error, "error");
      }
    } catch (e) {
      addToast("Erro de conexão", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  // Get current tab info
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <AdminPageShell
      title={course.title || "Novo Curso"}
      description={currentTab.description}
      backLink="/admin/courses"
      breadcrumbs={[
        { label: "Cursos", href: "/admin/courses" },
        { label: course.title || "Curso" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              Pendentes
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/portal/course/${course.id}`, "_blank")}
            className="hidden sm:flex"
          >
            <ExternalLink size={16} />
            <span className="ml-2">Preview</span>
          </Button>

          <Button
            variant={course.status === "open" ? "ghost" : "outline"}
            size="sm"
            onClick={handleTogglePublish}
            isLoading={isPublishing}
            className={cn(
              course.status === "open"
                ? "text-orange-600 hover:bg-orange-50"
                : "text-green-600 border-green-200 hover:bg-green-50",
            )}
          >
            {course.status === "open" ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
            <span className="ml-2 hidden sm:inline">
              {course.status === "open" ? "Despublicar" : "Publicar"}
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
      }
    >
      {/* Tabs Navigation - Simplified for new Shell */}
      <div className="flex overflow-x-auto -mb-px border-b border-stone-100 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50",
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="py-4"
        >
          {activeTab === "info" && (
            <FormShell className="max-w-none grid lg:grid-cols-3 gap-8 bg-transparent border-0 shadow-none p-0">
              {/* Left Column - Image & Meta */}
              <div className="lg:col-span-1 space-y-6">
                <FormSection
                  title="Capa do Curso"
                  description="Imagem de destaque"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 relative group border border-stone-100 shadow-inner">
                    {course.coverImage ? (
                      <>
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => updateCourse({ coverImage: "" })}
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
                    defaultImage={course.coverImage || ""}
                    onUpload={(url) => updateCourse({ coverImage: url })}
                    folder="courses/covers"
                  />
                </FormSection>

                <FormSection title="Indicadores">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100">
                      <span className="text-sm text-stone-500 flex items-center gap-2">
                        <Users size={16} /> Alunos
                      </span>
                      <span className="font-bold text-stone-800">
                        {course.stats?.studentsCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100">
                      <span className="text-sm text-stone-500 flex items-center gap-2">
                        <BookOpen size={16} /> Aulas
                      </span>
                      <span className="font-bold text-stone-800">
                        {course.stats?.lessonsCount || 0}
                      </span>
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Right Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <FormSection
                  title="Dados Gerais"
                  description="Como o curso aparece no portal"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Título
                      </label>
                      <input
                        value={course.title || ""}
                        onChange={(e) =>
                          updateCourse({ title: e.target.value })
                        }
                        className="w-full text-xl font-bold p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none"
                        placeholder="Ex: Formação em Gestalt-Terapia"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Subtítulo
                      </label>
                      <input
                        value={course.subtitle || ""}
                        onChange={(e) =>
                          updateCourse({ subtitle: e.target.value })
                        }
                        className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm"
                        placeholder="Frase de destaque..."
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Planejamento"
                  description="Estrutura e instrutoria"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Instrutor
                      </label>
                      <input
                        value={course.instructor || ""}
                        onChange={(e) =>
                          updateCourse({ instructor: e.target.value })
                        }
                        className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Categoria
                      </label>
                      <input
                        value={course.category || ""}
                        onChange={(e) =>
                          updateCourse({ category: e.target.value })
                        }
                        className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Duração
                      </label>
                      <input
                        value={course.duration || ""}
                        onChange={(e) =>
                          updateCourse({ duration: e.target.value })
                        }
                        className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pl-1">
                        Nível
                      </label>
                      <select
                        value={course.level || "beginner"}
                        onChange={(e) =>
                          updateCourse({ level: e.target.value })
                        }
                        className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm cursor-pointer"
                      >
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                      </select>
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Descrição"
                  description="Detalhamento do programa"
                >
                  <textarea
                    value={course.description || ""}
                    onChange={(e) =>
                      updateCourse({ description: e.target.value })
                    }
                    rows={6}
                    className="w-full p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none resize-none text-sm"
                  />
                </FormSection>
              </div>
            </FormShell>
          )}

          {activeTab === "curriculum" && (
            <CourseCurriculumTab courseId={course.id} />
          )}
          {activeTab === "students" && (
            <CourseStudentsTab courseId={course.id} />
          )}
          {activeTab === "materials" && (
            <CourseMaterialsTab courseId={course.id} />
          )}
          {activeTab === "announcements" && (
            <CourseAnnouncementsTab courseId={course.id} />
          )}
          {activeTab === "community" && (
            <CourseCommunityTab courseId={course.id} />
          )}
          {activeTab === "settings" && <CourseSettingsTab course={course} />}
        </motion.div>
      </AnimatePresence>

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
    </AdminPageShell>
  );
}
