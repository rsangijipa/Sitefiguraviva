"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Image as ImageIcon,
  Save,
  Loader2,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/admin/ImageUpload";
import { adminCourseService } from "@/services/adminCourseService";
import { useToast } from "@/context/ToastContext";

import { Modal } from "@/components/ui/Modal";

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  category: string;
  duration: string;
  level: string;
  coverImage: string;
  status: "draft" | "open" | "closed";
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
  level: "beginner",
  coverImage: "",
  status: "draft",
};

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
          level: editingCourse.level || "beginner",
          coverImage: editingCourse.coverImage || editingCourse.image || "",
          status: editingCourse.status || "draft",
        }
      : initialFormState,
  );

  const [activeSection, setActiveSection] = useState<
    "info" | "details" | "settings"
  >("info");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = (field: keyof CourseFormData, value: string) => {
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
          level: formData.level,
          description: formData.description,
          coverImage: formData.coverImage,
          image: formData.coverImage,
          status: formData.status,
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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white font-bold">
                {isEditing ? "Editar Curso" : "Criar Novo Curso"}
              </h2>
              <p className="text-sm text-white/70">
                {isEditing
                  ? "Atualize as informações do curso"
                  : "Preencha as informações do curso"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Section Tabs */}
        <div
          className="flex overflow-x-auto border-b border-stone-100 bg-stone-50"
          data-lenis-prevent
        >
          {[
            { id: "info", label: "Informações Básicas" },
            { id: "details", label: "Detalhes & Mídia" },
            { id: "settings", label: "Configurações" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`shrink-0 whitespace-nowrap px-4 py-3 text-xs font-medium transition-colors md:flex-1 md:px-6 md:py-4 md:text-sm ${
                activeSection === section.id
                  ? "bg-white text-primary border-b-2 border-primary"
                  : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Section: Info */}
          {activeSection === "info" && (
            <div className="space-y-6 animate-fade-in">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full text-2xl font-serif font-bold p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Ex: Formação em Gestalt-Terapia"
                  autoFocus
                />
              </div>

              {/* Subtitle */}
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

              {/* Description */}
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

              {/* Instructor & Category */}
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
            </div>
          )}

          {/* Section: Details */}
          {activeSection === "details" && (
            <div className="space-y-8 animate-fade-in">
              {/* Cover Image */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Imagem de Capa
                </label>
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
                    <p className="text-xs text-stone-400 mt-2">
                      Recomendado: 1920x1080px (16:9)
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration & Level */}
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
            </div>
          )}

          {/* Section: Settings */}
          {activeSection === "settings" && (
            <div className="space-y-6 animate-fade-in">
              {/* Status */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Status do Curso
                </label>
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
                      onClick={() => updateField("status", option.value)}
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
              </div>

              {/* Info Box */}
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
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-8 py-6 bg-stone-50 flex items-center justify-between">
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
        </div>
      </motion.div>
    </Modal>
  );
}
