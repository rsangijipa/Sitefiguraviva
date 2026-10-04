"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveGalleryItemAction } from "@/app/actions/gallery";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";

export default function NewGalleryImagePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Geral",
    tags: "",
    caption: "",
    src: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.src) {
      addToast("Faça o upload de uma imagem antes de salvar.", "error");
      return;
    }
    if (!formData.title.trim()) {
      addToast("O título da foto é obrigatório.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveGalleryItemAction(null, formData);
      if (res.success) {
        addToast("Imagem adicionada à galeria com sucesso!", "success");
        router.push("/admin/gallery");
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      console.error("Error saving gallery item:", error);
      addToast("Erro ao salvar imagem: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageShell
      title="Nova Imagem na Galeria"
      description="Faça upload de fotos de eventos, workshops e do espaço para exibição no site."
      breadcrumbs={[
        { label: "Galeria", href: "/admin/gallery" },
        { label: "Nova Imagem" },
      ]}
      backLink="/admin/gallery"
      actions={
        <div className="flex items-center gap-3">
          <Link href="/admin/gallery">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1.5" />
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            <Save size={16} className="mr-1.5" />
            Salvar Imagem
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 flex items-center gap-2 text-primary font-semibold text-sm">
          <ImageIcon size={18} className="text-primary" />
          <span>Upload e Metadados da Fotografia</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 bg-stone-50/30 space-y-6">
          <FormShell className="max-w-none grid lg:grid-cols-12 gap-8 bg-transparent border-0 shadow-none p-0">
            {/* Coluna Esquerda: Preview e Upload da Imagem */}
            <div className="lg:col-span-5 space-y-4">
              <FormSection
                title="Fotografia"
                description="Selecione ou arraste o arquivo de imagem"
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
                  <p className="text-xs text-stone-400">
                    Formatos suportados: PNG, JPG ou WebP. Proporção recomendada: 4:3 ou 16:9.
                  </p>
                </div>
              </FormSection>
            </div>

            {/* Coluna Direita: Informações e Categorização */}
            <div className="lg:col-span-7 space-y-6">
              <FormSection
                title="Informações da Foto"
                description="Detalhes que identificam a foto na galeria e nas buscas"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="photo-title" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Título / Evento *
                    </label>
                    <input
                      id="photo-title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Workshop de Gestalt no Jardim"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base font-serif font-bold text-stone-800 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="photo-category" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Categoria
                    </label>
                    <select
                      id="photo-category"
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
                    <label htmlFor="photo-caption" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Legenda Descritiva
                    </label>
                    <textarea
                      id="photo-caption"
                      rows={4}
                      value={formData.caption}
                      onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                      placeholder="Breve relato sobre este momento, participantes ou data..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="photo-tags" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      id="photo-tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="presencial, vivencia, turma-2026"
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
                  Salvar e Publicar na Galeria
                </Button>
              </div>
            </div>
          </FormShell>
        </form>
      </div>
    </AdminPageShell>
  );
}
