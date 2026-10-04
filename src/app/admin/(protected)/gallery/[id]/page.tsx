"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Trash2, Loader2, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  saveGalleryItemAction,
  deleteGalleryItemAction,
} from "@/app/actions/gallery";
import { useGallery } from "@/hooks/useContent";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";

export default function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const { data: gallery = [], isLoading: loadingGallery } = useGallery();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Geral",
    tags: "",
    caption: "",
    src: "",
  });

  useEffect(() => {
    if (gallery.length > 0) {
      const item = gallery.find((g: any) => g.id === id);
      if (item) {
        setFormData({
          title: item.title || "",
          category: item.category || "Geral",
          tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
          caption: item.caption || "",
          src: item.src || "",
        });
      }
    }
  }, [gallery, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.src) {
      addToast("A imagem é obrigatória.", "error");
      return;
    }
    if (!formData.title.trim()) {
      addToast("O título da foto é obrigatório.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveGalleryItemAction(id, formData);
      if (res.success) {
        addToast("Imagem atualizada com sucesso!", "success");
        router.push("/admin/gallery");
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      console.error("Error updating gallery item:", error);
      addToast("Erro ao atualizar imagem: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta imagem da galeria?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteGalleryItemAction(id);
      if (res.success) {
        addToast("Imagem excluída com sucesso.", "success");
        router.push("/admin/gallery");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast("Erro ao excluir imagem: " + err.message, "error");
      setIsDeleting(false);
    }
  };

  return (
    <AdminPageShell
      title={formData.title ? `Editar: ${formData.title}` : "Editar Imagem"}
      description="Atualize a imagem, metadados ou legenda da foto na galeria."
      breadcrumbs={[
        { label: "Galeria", href: "/admin/gallery" },
        { label: formData.title || "Editar" },
      ]}
      backLink="/admin/gallery"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={16} className="mr-1.5" />
            Excluir
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            <Save size={16} className="mr-1.5" />
            Salvar Alterações
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 flex items-center gap-2 text-primary font-semibold text-sm">
          <ImageIcon size={18} className="text-primary" />
          <span>Edição de Foto</span>
        </div>

        {loadingGallery && !formData.src ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Carregando imagem...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 bg-stone-50/30 space-y-6">
            <FormShell className="max-w-none grid lg:grid-cols-12 gap-8 bg-transparent border-0 shadow-none p-0">
              {/* Coluna Esquerda: Preview e Upload da Imagem */}
              <div className="lg:col-span-5 space-y-4">
                <FormSection
                  title="Fotografia"
                  description="Substituir imagem existente ou manter"
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                      <ImageUpload
                        defaultImage={formData.src}
                        onUpload={(url) => setFormData((prev) => ({ ...prev, src: url }))}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Coluna Direita: Informações e Categorização */}
              <div className="lg:col-span-7 space-y-6">
                <FormSection
                  title="Informações da Foto"
                  description="Título, categoria, legenda e tags"
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-photo-title" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Título / Evento *
                      </label>
                      <input
                        id="edit-photo-title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Título da foto..."
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base font-serif font-bold text-stone-800 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-photo-category" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Categoria
                      </label>
                      <select
                        id="edit-photo-category"
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                      >
                        <option value="Geral">Geral</option>
                        <option value="Eventos">Eventos</option>
                        <option value="Workshops">Workshops</option>
                        <option value="Espaço">Espaço</option>
                        <option value="Encontros">Encontros</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-photo-caption" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Legenda Descritiva
                      </label>
                      <textarea
                        id="edit-photo-caption"
                        rows={4}
                        value={formData.caption}
                        onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                        placeholder="Descrição da imagem..."
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-photo-tags" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Tags (separadas por vírgula)
                      </label>
                      <input
                        id="edit-photo-tags"
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                        placeholder="Tags separadas por vírgula"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-600 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </FormSection>

                {/* Ações Inferiores */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <Link href="/admin/gallery">
                    <Button variant="ghost" type="button">
                      <ArrowLeft size={16} className="mr-1.5" />
                      Voltar para Galeria
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="shadow-lg shadow-primary/20"
                  >
                    <Sparkles size={16} className="mr-1.5" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </FormShell>
          </form>
        )}
      </div>
    </AdminPageShell>
  );
}
