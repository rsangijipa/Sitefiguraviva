"use client";

import { useState } from "react";
import { BookOpen, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import SyllabusEditor from "@/components/admin/courses/SyllabusEditor";
import { adminCourseService } from "@/services/adminCourseService";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/Modal";
import { FormSection } from "@/components/admin/FormShell";

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  category: string;
  duration: string;
  frequency: string;
  level: string;
  coverImage: string;
  status: "draft" | "open" | "closed";
  syllabus: string[];
}

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (courseId: string) => void;
  editingCourse?: any; // For editing existing courses
}

const initialFormState: CourseFormData = {
  title: "",
  subtitle: "",
  description: "",
  instructor: "",
  category: "",
  duration: "",
  frequency: "",
  level: "beginner",
  coverImage: "",
  status: "draft",
  syllabus: [],
};

const SECTIONS = [
  { id: "info", label: "Informações Básicas" },
  { id: "details", label: "Detalhes & Mídia" },
  { id: "syllabus", label: "Ementa" },
  { id: "settings", label: "Configurações" },
] as const;

export default function CourseEditorModal({
  isOpen,
  onClose,
  onSuccess,
  editingCourse,
}: CourseEditorModalProps) {
  const { addToast } = useToast();
  const isEditing = !!editingCourse;

  const [formData, setFormData] = useState<CourseFormData>(
    editingCourse
      ? {
          title: editingCourse.title || "",
          subtitle: editingCourse.subtitle || "",
          description: editingCourse.description || "",
          instructor: editingCourse.instructor || "",
          category: editingCourse.category || "",
          duration: editingCourse.duration || "",
          frequency: editingCourse.frequency || "",
          level: editingCourse.level || "beginner",
          coverImage: editingCourse.coverImage || editingCourse.image || "",
          status: editingCourse.status || "draft",
          syllabus: Array.isArray(editingCourse.syllabus)
            ? editingCourse.syllabus
            : [],
        }
      : initialFormState,
  );

  const [activeSection, setActiveSection] =
    useState<(typeof SECTIONS)[number]["id"]>("info");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = <K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      addToast("O título é obrigatório", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        // Update existing course
        await adminCourseService.updateCourse(editingCourse.id, {
          ...formData,
          image: formData.coverImage, // Dual-write for compatibility
        });
        addToast("Curso atualizado com sucesso!", "success");
        onSuccess?.(editingCourse.id);
      } else {
        const newCourseId = await adminCourseService.createCourse({
          title: formData.title,
          subtitle: formData.subtitle,
          instructor: formData.instructor,
          category: formData.category,
          duration: formData.duration,
          frequency: formData.frequency,
          level: formData.level,
          description: formData.description,
          coverImage: formData.coverImage,
          image: formData.coverImage,
          status: formData.status,
          syllabus: formData.syllabus,
        });

        addToast("Curso criado com sucesso!", "success");
        onSuccess?.(newCourseId);
      }

      setHasChanges(false);
      onClose();
    } catch (error: any) {
      console.error("Error saving course:", error);
      addToast(error.message || "Erro ao salvar curso", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!confirm("Você tem alterações não salvas. Deseja sair?")) {
        return;
      }
    }
    setFormData(initialFormState);
    setHasChanges(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaLabel="Editor de curso">
      <ModalContent size="xl" className="max-h-[92vh]">
        <ModalHeader>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl md:text-2xl text-stone-800 font-bold">
                {isEditing ? "Editar Curso" : "Criar Novo Curso"}
              </h2>
              <p className="text-sm text-stone-500">
                {isEditing
                  ? "Atualize as informações do curso"
                  : "Preencha as informações do curso"}
              </p>
            </div>
          </div>
        </ModalHeader>

        {/* Section Tabs — matches the tab styling used across the admin panel */}
        <div className="flex overflow-x-auto border-b border-stone-100 bg-stone-50/50 shrink-0 px-5 md:px-8">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "shrink-0 whitespace-nowrap px-4 py-3 text-xs font-medium border-b-2 transition-all md:px-6 md:text-sm",
                activeSection === section.id
                  ? "border-primary text-primary"
                  : "border-transparent text-stone-500 hover:text-stone-800",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        <ModalBody>
          {/* Section: Info */}
          {activeSection === "info" && (
            <FormSection
              title="Informações Básicas"
              description="Como o curso aparece no catálogo"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full text-xl font-serif font-bold p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Ex: Formação em Gestalt-Terapia"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Uma frase de efeito que descreve o curso..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={5}
                  className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none resize-none"
                  placeholder="Descrição detalhada do curso, objetivos, público-alvo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Instrutor(a)
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => updateField("instructor", e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="Nome do instrutor"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="Ex: Gestalt-Terapia"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Section: Details */}
          {activeSection === "details" && (
            <div className="space-y-8">
              <FormSection
                title="Imagem de Capa"
                description="Recomendado: 1920x1080px (16:9)"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden relative group">
                    {formData.coverImage ? (
                      <>
                        <img
                          src={formData.coverImage}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => updateField("coverImage", "")}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                        <ImageIcon size={48} />
                        <span className="text-sm mt-2">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <ImageUpload
                      defaultImage={formData.coverImage}
                      onUpload={(url) => updateField("coverImage", url)}
                      folder="courses/covers"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Duração e Frequência"
                description="Como o curso se organiza no tempo"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Duração
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="Ex: 20 horas, 10 semanas"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Frequência
                    </label>
                    <input
                      type="text"
                      value={formData.frequency}
                      onChange={(e) => updateField("frequency", e.target.value)}
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="Ex: Encontros quinzenais, 2x por semana"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Nível de Dificuldade
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => updateField("level", e.target.value)}
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="beginner">🌱 Iniciante</option>
                      <option value="intermediate">🌿 Intermediário</option>
                      <option value="advanced">🌳 Avançado</option>
                    </select>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* Section: Syllabus (Ementa) */}
          {activeSection === "syllabus" && (
            <FormSection
              title="Ementa Básica"
              description="Tópicos que aparecem na página do curso para quem está decidindo se inscrever"
            >
              <SyllabusEditor
                topics={formData.syllabus}
                onChange={(syllabus) => updateField("syllabus", syllabus)}
              />
            </FormSection>
          )}

          {/* Section: Settings */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <FormSection title="Status do Curso">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      value: "draft",
                      label: "Rascunho",
                      desc: "Não visível para alunos",
                      color: "stone",
                    },
                    {
                      value: "open",
                      label: "Publicado",
                      desc: "Aberto para inscrições",
                      color: "green",
                    },
                    {
                      value: "closed",
                      label: "Encerrado",
                      desc: "Inscrições fechadas",
                      color: "orange",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("status", option.value as any)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.status === option.value
                          ? option.color === "green"
                            ? "border-green-500 bg-green-50"
                            : option.color === "orange"
                              ? "border-orange-500 bg-orange-50"
                              : "border-stone-400 bg-stone-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            option.color === "green"
                              ? "bg-green-500"
                              : option.color === "orange"
                                ? "bg-orange-500"
                                : "bg-stone-400"
                          }`}
                        />
                        <span className="font-bold text-stone-800">
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </FormSection>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h4 className="font-bold text-primary mb-2">
                  📚 Próximos Passos
                </h4>
                <ul className="text-sm text-stone-600 space-y-2">
                  <li>
                    • Após criar o curso, você poderá adicionar módulos e aulas
                  </li>
                  <li>• Configure materiais complementares e comunidade</li>
                  <li>• Defina regras de certificação e preços</li>
                </ul>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="flex items-center justify-between">
          <div className="text-sm text-stone-400">
            {hasChanges && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Alterações não salvas
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={isSaving ? undefined : <Save size={18} />}
              disabled={!formData.title.trim() || isSaving}
              className="min-w-[180px]"
            >
              {isEditing ? "Salvar Alterações" : "Criar Curso"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
