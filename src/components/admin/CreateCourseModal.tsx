"use client";

import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    subtitle: string;
    instructor: string;
    category: string;
    duration: string;
    level: string;
  }) => Promise<void>;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCreate,
}: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    instructor: "",
    category: "",
    duration: "",
    level: "beginner",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(formData);
      // Reset form
      setFormData({
        title: "",
        subtitle: "",
        instructor: "",
        category: "",
        duration: "",
        level: "beginner",
      });
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-stone-100 px-8 py-6 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-primary font-bold">
                      Criar Novo Curso
                    </h2>
                    <p className="text-sm text-stone-500">
                      Preencha as informações básicas
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-stone-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-xs font-bold uppercase tracking-widest text-stone-400"
                  >
                    Título do Curso *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full text-xl font-serif font-bold p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="Ex: Formação em Gestalt-Terapia"
                    autoFocus
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <label
                    htmlFor="subtitle"
                    className="text-xs font-bold uppercase tracking-widest text-stone-400"
                  >
                    Subtítulo
                  </label>
                  <input
                    id="subtitle"
                    name="subtitle"
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="Uma frase de efeito..."
                  />
                </div>

                {/* Instructor & Category */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="instructor"
                      className="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                      Instrutor(a)
                    </label>
                    <input
                      id="instructor"
                      name="instructor"
                      type="text"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="Nome do instrutor"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="category"
                      className="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                      Categoria
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="Ex: Gestalt-Terapia"
                    />
                  </div>
                </div>

                {/* Duration & Level */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="duration"
                      className="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                      Duração
                    </label>
                    <input
                      id="duration"
                      name="duration"
                      type="text"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="Ex: 20 horas"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="level"
                      className="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                      Nível
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="w-full p-4 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-primary transition-all outline-none appearance-none"
                    >
                      <option value="beginner">Iniciante</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isCreating}
                    disabled={!formData.title.trim() || isCreating}
                  >
                    Criar Curso
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
