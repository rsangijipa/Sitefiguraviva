"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Download, Lock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FileUpload from "@/components/admin/FileUpload";
import {
  addMaterialAction,
  deleteMaterialAction,
  getMaterialsAction,
} from "@/app/actions/admin/course-mutations";

interface MaterialsManagerProps {
  courseId: string;
}

export default function MaterialsManager({ courseId }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMaterials = async () => {
    if (!courseId) return;

    try {
      const docs = await getMaterialsAction(courseId);
      setMaterials(docs as any[]);
    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar materiais.", "error");
    }
  };

  // Fetch materials for this course
  useEffect(() => {
    void loadMaterials();
  }, [courseId]);

  const initialForm = {
    title: "",
    type: "pdf",
    file_url: "",
    file_path: "",
    file_size: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setIsSubmitting(true);

    try {
      if (!formData.file_url) {
        addToast("Envie um arquivo PDF.", "error");
        return;
      }

      await addMaterialAction(courseId, {
        title: formData.title,
        type: "pdf",
        url: formData.file_url,
        description: formData.file_size,
        filePath: formData.file_path,
        isPublished: true,
      });

      addToast("Material adicionado!", "success");
      setFormData(initialForm);
      setIsAdding(false);
      await loadMaterials();
    } catch (error) {
      console.error(error);
      addToast("Erro ao salvar material.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (materialId: string, filePath?: string) => {
    if (!confirm("Excluir este material?")) return;
    try {
      await deleteMaterialAction(courseId, materialId, filePath);
      await loadMaterials();
      addToast("Material excluído.", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao excluir.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-serif text-xl text-primary flex items-center gap-2">
            <Lock size={18} className="text-gold" />
            Materiais Didáticos
          </h4>
          <p className="text-xs text-primary/40">
            Visível apenas para alunos matriculados.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:text-gold flex items-center gap-2"
        >
          <Plus size={14} /> {isAdding ? "Cancelar" : "Adicionar"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                Título do Material
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-gold rounded-lg px-4 py-3 text-sm"
                placeholder="Ex: Apostila Módulo 1"
              />
            </div>
            <div className="space-y-1">
              <FileUpload
                folder={`courses/${courseId}/materials`}
                defaultFile={formData.file_url}
                onUpload={(data) =>
                  setFormData((prev) => ({
                    ...prev,
                    file_url: data.url,
                    file_path: data.path,
                    file_size: data.size,
                  }))
                }
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !formData.file_url}
              className="bg-primary text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : "Salvar Material"}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {materials.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl border border-stone-100 flex items-center justify-between group hover:border-gold/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-stone-100 text-stone-400 rounded-lg">
                <FileText size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-primary">{item.title}</p>
                <p className="text-[10px] text-stone-400">
                  {item.description || item.type?.toUpperCase() || "PDF"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-primary/40 hover:text-primary transition-colors"
              >
                <Download size={16} />
              </a>
              <button
                onClick={() => handleDelete(item.id, item.filePath)}
                className="p-2 text-red-200 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {materials.length === 0 && !isAdding && (
          <p className="text-center text-xs text-primary/30 py-8">
            Nenhum material cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
